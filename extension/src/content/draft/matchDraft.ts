import { waitForElement } from "../utils/dom"
import { api } from "../api/api"
type PendingDraft = { itemId: number; title: string }
const norm = (s: string) =>
	s
		.replace(/\u00a0/g, " ")
		.replace(/[’‘`]/g, "'")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase()

function readDrafts() {
	const drafts: { id: string; label: string }[] = []
	document.querySelectorAll<HTMLElement>('[data-testid$="--status-text"]').forEach((el) => {
		if (el.textContent?.trim() !== "Brouillon") return
		const id = el.dataset.testid?.match(/product-item-id-(\d+)--/)?.[1]
		if (!id) return
		const link = document.querySelector<HTMLAnchorElement>(`[data-testid="product-item-id-${id}--overlay-link"]`)
		drafts.push({ id, label: norm(link?.title ?? "") })
	})
	return drafts
}

export async function matchPendingDraft() {
	const { pendingDraft } = (await chrome.storage.local.get("pendingDraft")) as { pendingDraft?: PendingDraft }
	if (!pendingDraft?.itemId) return

	const chip = await waitForElement<HTMLElement>('[data-testid="closet-seller-filters-draft"]')
	chip.click()
	await new Promise((r) => setTimeout(r, 1500))

	const wanted = norm(pendingDraft.title) + ","
	// en cas de doublons (anciens essais), l'id le plus grand est le plus récent
	const draft = readDrafts()
		.filter((d) => d.label.startsWith(wanted))
		.sort((a, b) => Number(b.id) - Number(a.id))[0]
	if (!draft) return console.warn("[Vinted Reupload] brouillon introuvable")

	await api.setStage(pendingDraft.itemId, "DRAFT", draft.id)
	await chrome.storage.local.remove("pendingDraft")
}
