import { fetchArticleDetails } from "../scraping/fetchArticle"
import { renderStoredItems } from "../widget/widget.render"

import { api } from "../api/api"
import { vintedIdFromUrl } from "../delete/deleteOriginal"
import { readDrafts } from "../draft/readDrafts"

export const selectedArticle = new Set<string>()

import { showToast, waitForElement } from "../utils/dom"

export const getCards = () =>
	[...document.querySelectorAll<HTMLElement>('[data-testid^="product-item-id-"]')].filter((el) => !el.dataset.testid?.includes("--"))

// Brouillon, réservé, vendu...
export const hasStatus = (card: HTMLElement) => !!card.querySelector('[data-testid$="--status-text"]')

const draftEditUrl = (id: string) => `https://www.vinted.fr/items/${id}/edit`

// Les brouillons ne sont affichés qu'avec le filtre "Brouillon" : on l'active si besoin (comme le fait matchDraft)
async function findDraftIds(): Promise<string[]> {
	if (readDrafts().length === 0) {
		try {
			const chip = await waitForElement<HTMLElement>('[data-testid="closet-seller-filters-draft"]', 3000)
			chip.click()
		} catch {
			return []
		}
		for (let i = 0; i < 20 && readDrafts().length === 0; i++) await new Promise((resolve) => setTimeout(resolve, 250))
	}
	return readDrafts().map((draft) => draft.id)
}

export async function finishSelection() {
	const cards = getCards()
	const [existingUrls, draftIds] = await Promise.all([api.getUrls(), api.getDraftIds()])

	// On compare des ids Vinted : ça couvre les articles (via sourceUrl) comme les brouillons déjà en base (via draftId)
	const knownIds = new Set<string>(draftIds)
	existingUrls.forEach((url) => {
		const id = vintedIdFromUrl(url)
		if (id) knownIds.add(id)
	})

	cards.forEach((card) => {
		if (hasStatus(card)) return
		const link = card.querySelector<HTMLAnchorElement>("a")
		if (!link?.href) return
		const id = vintedIdFromUrl(link.href)
		if (!id || !knownIds.has(id)) selectedArticle.add(link.href)
	})

	// Les brouillons en dernier : activer le filtre change la liste affichée, les articles sont déjà collectés
	for (const id of await findDraftIds()) {
		if (!knownIds.has(id)) selectedArticle.add(draftEditUrl(id))
	}

	console.log(`[Vinted Reupload] ${cards.length} cartes trouvées, ${selectedArticle.size} à ajouter (brouillons compris)`)
	if (selectedArticle.size === 0) {
		showToast("Aucun nouvel article à ajouter sur cette page")
		return
	}

	let ok = 0
	const failed: string[] = []
	for (const article of [...selectedArticle]) {
		try {
			const item = await fetchArticleDetails(article)
			await api.saveItem(item)
			ok++
			console.log(`[Vinted Reupload] ajouté (${ok}) :`, item.title)
		} catch (error) {
			failed.push(article)
			console.error("[Vinted Reupload] échec pour", article, error)
		}
		selectedArticle.delete(article)
		await new Promise((resolve) => setTimeout(resolve, 5000))
	}

	await renderStoredItems()
	showToast(failed.length ? `${ok} ajouté(s), ${failed.length} en échec (voir la console)` : `${ok} article(s) ajouté(s)`)
}

export function updateWidgetCount() {
	const count = selectedArticle.size

	const label = document.getElementById("vr-widget-label")!

	label.textContent = count === 0 ? "Vinted Reupload" : `${count} article${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}`
}
