import { handlePrefill } from "./prefill/prefill"
import { fetchPhotosFromCarousel } from "./scraping/fetchCaroussel"
import { initWidget } from "./widget/widget"
import { injectStyles } from "./widget/widget.styles"

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === "GET_PHOTOS") {
		fetchPhotosFromCarousel().then(sendResponse)
		return true
	}
})

chrome.runtime.sendMessage({ type: "CONTENT_READY" })

// Le reste
injectStyles()
initWidget()
setInterval(() => {
	if (!document.getElementById("vr-widget")) {
		initWidget()
	}
}, 500)
handlePrefill()
