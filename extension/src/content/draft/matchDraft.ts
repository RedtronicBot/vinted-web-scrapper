import { waitForElement } from "../utils/dom"
import { api } from "../api/api"
type PendingDraft = { itemId: number; title: string }
const key = (s: string) =>
	s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&amp;/g, "&")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()

function readDrafts() {
	const drafts: { id: string; label: string; key: string }[] = []
	document.querySelectorAll<HTMLElement>('[data-testid$="--status-text"]').forEach((el) => {
		if (el.textContent?.trim() !== "Brouillon") return
		const id = el.dataset.testid?.match(/product-item-id-(\d+)--/)?.[1]
		if (!id) return
		const link = document.querySelector<HTMLAnchorElement>(`[data-testid="product-item-id-${id}--overlay-link"]`)
		const label = link?.title ?? ""
		drafts.push({ id, label, key: key(label) })
	})
	return drafts
}

export async function matchPendingDraft() {
	const { pendingDraft } = (await chrome.storage.local.get("pendingDraft")) as { pendingDraft?: PendingDraft }
	if (!pendingDraft?.itemId) return

	// on ne clique que si les brouillons ne sont pas déjà affichés
	if (readDrafts().length === 0) {
		const chip = await waitForElement<HTMLElement>('[data-testid="closet-seller-filters-draft"]')
		chip.click()
	}

	const wanted = key(pendingDraft.title)
	let draft
	for (let i = 0; i < 40 && !draft; i++) {
		draft = readDrafts()
			.filter((d) => d.key.startsWith(wanted))
			.sort((a, b) => Number(b.id) - Number(a.id))[0]
		if (!draft) await new Promise((r) => setTimeout(r, 250))
	}

	if (!draft) {
		console.warn("[Vinted Reupload] brouillon introuvable", {
			wanted,
			drafts: readDrafts().map((d) => d.key),
		})
		return
	}

	await api.setStage(pendingDraft.itemId, "DRAFT", draft.id)
	await chrome.storage.local.remove("pendingDraft")
}
