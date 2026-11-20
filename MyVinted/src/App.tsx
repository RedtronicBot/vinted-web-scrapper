import { useEffect, useState } from "react"
import { PushNotifications } from "@capacitor/push-notifications"
import { getSavedBrowser, listBrowsers, openInChosenBrowser, saveBrowser } from "./browserPicker"

const API_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY

export default function App() {
	const [log, setLog] = useState<string[]>([])
	const [browsers, setBrowsers] = useState<{ package: string; name: string }[]>([])
	const [selected, setSelected] = useState("")
	const add = (m: string) => setLog((l) => [...l, m])

	useEffect(() => {
		// listeners posés une seule fois au lancement
		PushNotifications.addListener("registration", async ({ value }) => {
			add("Token : " + value.slice(0, 20) + "...")
			const res = await fetch(`${API_URL}/devices`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
				body: JSON.stringify({ token: value }),
			})
			add("Enregistrement back : " + res.status)
		})
		PushNotifications.addListener("registrationError", (e) => add("Erreur : " + JSON.stringify(e)))
		PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
			const url = notification.data?.url
			if (url) openInChosenBrowser(url)
		})

		// liste des navigateurs + choix déjà enregistré
		listBrowsers()
			.then(setBrowsers)
			.catch((e) => add("Erreur navigateurs : " + String(e)))
		getSavedBrowser().then(setSelected)

		return () => {
			PushNotifications.removeAllListeners()
		}
	}, [])

	async function enable() {
		let perm = await PushNotifications.checkPermissions()
		if (perm.receive === "prompt") perm = await PushNotifications.requestPermissions()
		if (perm.receive !== "granted") return add("Permission refusée")
		await PushNotifications.register()
	}

	async function onSelect(pkg: string) {
		setSelected(pkg)
		await saveBrowser(pkg)
	}

	async function runNotify() {
		try {
			const res = await fetch(`${API_URL}/notifications/run`, {
				method: "POST",
				headers: { "x-api-key": API_KEY },
			})
			add("Envoi manuel : " + res.status)
		} catch (e) {
			add("Erreur : " + String(e))
		}
	}

	return (
		<div style={{ padding: 16 }}>
			<button onClick={enable}>Activer les notifications</button>
			<button onClick={runNotify}>Lancer notifyDueItems</button>

			<h3>Navigateur</h3>
			<select value={selected} onChange={(e) => onSelect(e.target.value)}>
				<option value="">Choisir...</option>
				{browsers.map((b) => (
					<option key={b.package} value={b.package}>
						{b.name}
					</option>
				))}
			</select>
			<button onClick={() => openInChosenBrowser("https://www.vinted.fr/items/new#vr=1")}>Tester l'ouverture</button>

			{log.map((l, i) => (
				<p key={i}>{l}</p>
			))}
		</div>
	)
}
