import { useEffect, useState } from "react"
import { PushNotifications } from "@capacitor/push-notifications"
import { getSavedBrowser, listBrowsers, openInChosenBrowser, saveBrowser } from "./browserPicker"
import useSWR from "swr"

const API_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY

type Stage = "PENDING" | "DRAFT" | "PUBLISHED"

type itemsType = {
  id: number
  title: string
  price: string
  status: string
  description: string
  brand: string
  size: string
  color: string
  material: string
  category: string[]
  dimensions: string[]
  photos: { filename: string; position: number }[]
  reuploadAt: string | null
  sourceUrl: string
  stage: Stage
  draftId: string
  notifiedAt: string
}

const TABS: { stage: Stage; label: string }[] = [
  { stage: "PENDING", label: "À republier" },
  { stage: "DRAFT", label: "Brouillons" },
]

const fetcher = async (url: string) => {
  const res = await fetch(url, { headers: { "x-api-key": API_KEY } })
  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
  return res.json()
}

function coverUrl(item: itemsType) {
  const first = [...item.photos].sort((a, b) => a.position - b.position)[0]
  return first ? `${API_URL}/uploads/${first.filename}` : null
}

export default function App() {
  const [browsers, setBrowsers] = useState<{ package: string; name: string }[]>([])
  const [selected, setSelected] = useState("")
  const [stage, setStage] = useState<Stage>("PENDING")

  useEffect(() => {
    // listeners posés une seule fois au lancement
    PushNotifications.addListener("registration", async ({ value }) => {
      await fetch(`${API_URL}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ token: value }),
      })
    })
    PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
      const url = notification.data?.url
      if (url) openInChosenBrowser(url)
    })

    // liste des navigateurs + choix déjà enregistré
    listBrowsers().then(setBrowsers)
    getSavedBrowser().then(setSelected)

    return () => {
      PushNotifications.removeAllListeners()
    }
  }, [])

  async function onSelect(pkg: string) {
    setSelected(pkg)
    await saveBrowser(pkg)
  }

  const { data: items, error, isLoading, mutate } = useSWR<itemsType[]>(`${API_URL}/items/due`, fetcher)

  const visible = items?.filter((item) => item.stage === stage) ?? []
  const countOf = (s: Stage) => items?.filter((item) => item.stage === s).length ?? 0
  function openItem(item: itemsType) {
    openInChosenBrowser(
      stage === "PENDING"
        ? `https://www.vinted.fr/items/new#vr=${item.id}`
        : `https://www.vinted.fr/items/${item.draftId}/edit#vr-publish=${item.id}`,
    )
  }
  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-950 pb-8 text-slate-100 scheme-dark">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur">
        <h1 className="text-lg font-semibold">Mes articles Vinted</h1>

        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-900 p-1">
          {TABS.map((tab) => {
            const active = tab.stage === stage
            return (
              <button
                key={tab.stage}
                onClick={() => setStage(tab.stage)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                  active ? "bg-slate-800 text-teal-300 shadow-sm" : "text-slate-400"
                }`}
              >
                {tab.label}
                {items && (
                  <span className={`rounded-full px-2 text-xs ${active ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-400"}`}>
                    {countOf(tab.stage)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      <main className="space-y-3 px-4 pt-4">
        {isLoading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="flex animate-pulse gap-3 rounded-2xl bg-slate-900 p-3 ring-1 ring-slate-800">
              <div className="h-20 w-20 shrink-0 rounded-xl bg-slate-800" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-slate-800" />
                <div className="h-3 w-1/4 rounded bg-slate-800" />
              </div>
            </div>
          ))}

        {error && (
          <div role="alert" className="rounded-2xl bg-red-950/50 p-4 text-sm text-red-300 ring-1 ring-red-900">
            <p className="font-medium">Impossible de charger les articles.</p>
            <p className="mt-1 text-red-400">{error.message}</p>
            <button onClick={() => mutate()} className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white active:bg-red-700">
              Réessayer
            </button>
          </div>
        )}

        {items && visible.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
            {stage === "PENDING" ? "Rien à republier pour le moment." : "Aucun brouillon à publier."}
          </p>
        )}

        {visible.map((item) => {
          const cover = coverUrl(item)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openItem(item)}
              className="flex w-full gap-3 rounded-2xl bg-slate-900 p-3 text-left ring-1 ring-slate-800 transition active:bg-slate-800"
            >
              {cover ? (
                <img src={cover} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-slate-800 object-cover" />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs text-slate-500">Pas de photo</div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-medium text-slate-100">{item.title}</h2>
                <p className="mt-0.5 text-sm font-semibold text-teal-400">{item.price} €</p>
                {item.reuploadAt && <p className="mt-1 text-xs text-slate-400">Depuis le {new Date(item.reuploadAt).toLocaleDateString("fr-FR")}</p>}
              </div>
            </button>
          )
        })}
      </main>

      <details className="mx-4 mt-6 rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
        <summary className="cursor-pointer text-sm font-medium text-slate-300">Réglages</summary>
        <div className="mt-3 space-y-3">
          <label className="block text-sm text-slate-400">
            Navigateur
            <select
              value={selected}
              onChange={(e) => onSelect(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Choisir...</option>
              {browsers.map((b) => (
                <option key={b.package} value={b.package}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => openInChosenBrowser("https://www.vinted.fr/items/new#vr=1")}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 active:bg-slate-800"
          >
            Tester l'ouverture
          </button>
        </div>
      </details>
    </div>
  )
}
