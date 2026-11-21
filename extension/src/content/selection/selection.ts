import { fetchArticleDetails } from "../scraping/fetchArticle"
import { renderStoredItems } from "../widget/widget.render"

import { api } from "../api/api"

export const selectedArticle = new Set<string>()

import { showToast } from "../utils/dom"

export const getCards = () =>
	[...document.querySelectorAll<HTMLElement>('[data-testid^="product-item-id-"]')].filter((el) => !el.dataset.testid?.includes("--"))

// Brouillon, réservé, vendu...
export const hasStatus = (card: HTMLElement) => !!card.querySelector('[data-testid$="--status-text"]')

export async function finishSelection() {
	const cards = getCards()
	const existingUrls = await api.getUrls()

	cards.forEach((card) => {
		if (hasStatus(card)) return
		const link = card.querySelector<HTMLAnchorElement>("a")
		if (link?.href && !existingUrls.includes(link.href)) selectedArticle.add(link.href)
	})

	console.log(`[Vinted Reupload] ${cards.length} cartes trouvées, ${selectedArticle.size} à ajouter`)
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
