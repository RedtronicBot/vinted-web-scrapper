import { waitForElement } from "../utils/dom"
import { api } from "../api/api"
import { vintedIdFromUrl, type PendingDelete } from "../delete/deleteOriginal"
import { key, readDrafts } from "./readDrafts"
type PendingDraft = { itemId: number; title: string }

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

	const item = await api.setStage(pendingDraft.itemId, "DRAFT", draft.id)
	await chrome.storage.local.remove("pendingDraft")

	// Le brouillon est enregistré : on peut aller supprimer l'ancien article
	const vintedId = item.sourceUrl ? vintedIdFromUrl(item.sourceUrl) : undefined
	if (!item.sourceUrl || !vintedId || vintedId === draft.id) return

	const pendingDelete: PendingDelete = { itemId: pendingDraft.itemId, vintedId }
	await chrome.storage.local.set({ pendingDelete })
	window.location.href = item.sourceUrl
}
