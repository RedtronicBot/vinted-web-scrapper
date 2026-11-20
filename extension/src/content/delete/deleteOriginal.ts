import { showToast, waitForElement } from "../utils/dom"

export type PendingDelete = { itemId: number; vintedId: string }

export const vintedIdFromUrl = (url: string) => url.match(/\/items\/(\d+)/)?.[1]

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function deleteOriginalIfPending() {
	// Uniquement sur une page article /items/<id>... (pas /items/new)
	const onPage = window.location.pathname.match(/^\/items\/(\d+)/)?.[1]
	if (!onPage) return

	const { pendingDelete } = (await chrome.storage.local.get("pendingDelete")) as { pendingDelete?: PendingDelete }

	// Garde-fou : on ne supprime que l'article exact qui était attendu
	if (!pendingDelete || pendingDelete.vintedId !== onPage) return

	// Retiré avant de cliquer : en cas de souci, on ne reboucle jamais sur une suppression
	await chrome.storage.local.remove("pendingDelete")

	try {
		const deleteBtn = await waitForElement<HTMLElement>('[data-testid="item-delete-button"]', 15000)
		await pause(1000)
		deleteBtn.click()

		const confirmBtn = await waitForElement<HTMLElement>('[data-testid="item-delete-confirmation-button"]', 10000)
		await pause(500)
		confirmBtn.click()
		console.log("[Vinted Reupload] ancien article supprimé :", onPage)
	} catch (e) {
		console.warn("[Vinted Reupload] suppression automatique impossible", e)
		showToast("Vinted Reupload : supprime l'ancien article à la main (le brouillon est bien créé)")
	}
}
