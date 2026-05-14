chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === "SCRAPE_ARTICLE") {
		chrome.tabs.create({ url: message.url, active: false }, (tab) => {
			const tabId = tab.id!

			chrome.runtime.onMessage.addListener(function listener(msg, msgSender) {
				if (msg.type === "CONTENT_READY" && msgSender.tab?.id === tabId) {
					chrome.runtime.onMessage.removeListener(listener)
					chrome.tabs.update(tabId, { active: true }, () => {
						setTimeout(() => {
							chrome.tabs.sendMessage(tabId, { type: "GET_PHOTOS" }, (photos) => {
								chrome.tabs.remove(tabId)
								sendResponse({ photos })
							})
						}, 2000)
					})
				}
			})
		})
		return true
	}
})
