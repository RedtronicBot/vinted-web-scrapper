const SCRAPE_TIMEOUT = 45000
const EMPTY = { photos: [], category: [] }

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type !== "SCRAPE_ARTICLE") return

	let tabId: number | undefined
	let done = false
	let started = false

	// Une seule réponse, quoi qu'il arrive : sans ça le canal se ferme et le content script plante
	const finish = (data: unknown) => {
		if (done) return
		done = true
		clearTimeout(timer)
		chrome.tabs.onUpdated.removeListener(onUpdated)
		chrome.tabs.onRemoved.removeListener(onRemoved)
		if (tabId !== undefined) chrome.tabs.remove(tabId).catch(() => {})
		sendResponse(data)
	}

	const start = () => {
		if (started || tabId === undefined) return
		started = true
		const id = tabId
		// Active l'onglet pour que Vinted rende les images
		chrome.tabs.update(id, { active: true }, () => {
			setTimeout(() => {
				chrome.tabs.sendMessage(id, { type: "GET_PAGE_DATA" }, (data) => {
					if (chrome.runtime.lastError) {
						console.error("Erreur:", chrome.runtime.lastError.message)
						return finish(EMPTY)
					}
					finish(data ?? EMPTY)
				})
			}, 5000)
		})
	}

	const onUpdated = (id: number, info: chrome.tabs.OnUpdatedInfo) => {
		if (id === tabId && info.status === "complete") start()
	}
	const onRemoved = (id: number) => {
		if (id === tabId) {
			tabId = undefined // déjà fermé, inutile de le refermer
			finish(EMPTY)
		}
	}
	const timer = setTimeout(() => finish(EMPTY), SCRAPE_TIMEOUT)

	// Listeners posés avant la création de l'onglet : on ne rate plus un "complete" trop rapide
	chrome.tabs.onUpdated.addListener(onUpdated)
	chrome.tabs.onRemoved.addListener(onRemoved)
	chrome.tabs.create({ url: message.url, active: false }, (tab) => {
		tabId = tab.id
		if (tab.status === "complete") start()
	})

	return true
})
