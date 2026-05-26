chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === "SCRAPE_ARTICLE") {
		chrome.tabs.create({ url: message.url, active: false }, (tab) => {
			const tabId = tab.id!

			chrome.tabs.onUpdated.addListener(function listener(id, info) {
				if (id !== tabId || info.status !== "complete") return
				chrome.tabs.onUpdated.removeListener(listener)

				// Active l'onglet pour que Vinted rende les images
				chrome.tabs.update(tabId, { active: true }, () => {
					setTimeout(() => {
						chrome.tabs.sendMessage(tabId, { type: "GET_PHOTOS" }, (photos) => {
							if (chrome.runtime.lastError) {
								console.error("❌ Erreur:", chrome.runtime.lastError.message)
								chrome.tabs.remove(tabId)
								sendResponse({ photos: [] })
								return
							}
							chrome.tabs.remove(tabId)
							sendResponse({ photos })
						})
					}, 5000)
				})
			})
		})
		return true
	}
})
