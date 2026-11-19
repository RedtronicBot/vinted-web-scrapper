import { useState } from "react"
import { PushNotifications } from "@capacitor/push-notifications"

const API_URL = "https://extensionapi.redtrotool.fr"
const API_KEY = "111b1ed4b05c1485004822d362b4d029"

export default function App() {
	const [log, setLog] = useState<string[]>([])
	const add = (m: string) => setLog((l) => [...l, m])

	async function enable() {
		let perm = await PushNotifications.checkPermissions()
		if (perm.receive === "prompt") perm = await PushNotifications.requestPermissions()
		if (perm.receive !== "granted") return add("Permission refusée")

		await PushNotifications.addListener("registration", async ({ value }) => {
			add("Token : " + value.slice(0, 20) + "...")
			const res = await fetch(`${API_URL}/devices`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
				body: JSON.stringify({ token: value }),
			})
			add("Enregistrement back : " + res.status)
		})
		await PushNotifications.addListener("registrationError", (e) => add("Erreur : " + JSON.stringify(e)))
		await PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => add("Tap, url = " + notification.data?.url))
		await PushNotifications.register()
	}

	return (
		<div style={{ padding: 16 }}>
			<button onClick={enable}>Activer les notifications</button>
			{log.map((l, i) => (
				<p key={i}>{l}</p>
			))}
		</div>
	)
}
