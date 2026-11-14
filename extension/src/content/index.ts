import { handlePrefill } from "./prefill/prefill"
import { fetchPhotosFromCarousel } from "./scraping/fetchCaroussel"
import { fetchCategoryFromPage } from "./scraping/fetchCategory"
import { initWidget } from "./widget/widget"
import { injectStyles } from "./widget/widget.styles"

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === "GET_PAGE_DATA") {
		const category = fetchCategoryFromPage()
		fetchPhotosFromCarousel().then((photos) => sendResponse({ photos, category }))
		return true
	}
})

chrome.runtime.sendMessage({ type: "CONTENT_READY", url: window.location.href })

// Le reste
injectStyles()
initWidget()
setInterval(() => {
	if (!document.getElementById("vr-widget")) {
		initWidget()
	}
}, 500)
handlePrefill()
