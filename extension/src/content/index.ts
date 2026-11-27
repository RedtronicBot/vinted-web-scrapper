import { deleteOriginalIfPending } from "./delete/deleteOriginal"
import { matchPendingDraft } from "./draft/matchDraft"
import { isDraftEditPage, readDraftFromPage } from "./draft/readDraft"
import { handlePrefill } from "./prefill/prefill"
import { addPublishedIfPending } from "./publish/afterPublish"
import { handlePublish } from "./publish/publishDraft"
import { fetchPhotosFromCarousel } from "./scraping/fetchCaroussel"
import { fetchCategoryFromPage } from "./scraping/fetchCategory"
import { initWidget } from "./widget/widget"
import { injectStyles } from "./widget/widget.styles"

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === "GET_PAGE_DATA") {
		// Page d'édition d'un brouillon : on lit le formulaire au lieu de la page article
		if (isDraftEditPage()) {
			readDraftFromPage()
				.then(sendResponse)
				.catch((error) => {
					console.error("[Vinted Reupload] lecture du brouillon impossible", error)
					sendResponse(null)
				})
			return true
		}
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
handlePublish()

if (window.location.pathname.startsWith("/member/")) {
	matchPendingDraft()
	addPublishedIfPending()
}
deleteOriginalIfPending()
