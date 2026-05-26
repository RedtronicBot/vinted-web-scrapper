import { fetchArticleDetails } from "../scraping/fetchArticle"
import { renderStoredItems } from "../widget/widget.render"

import { api } from "../api/api"

export const selectedArticle = new Set<string>()

export async function finishSelection() {
	// Collecte automatiquement tous les articles visibles
	const cards = [...document.querySelectorAll<HTMLElement>('[data-testid^="product-item-id-"]')].filter((el) => !el.dataset.testid?.includes("--"))
	const existingUrls = await api.getUrls()
	cards.forEach((card) => {
		const statusElement = card.querySelector('[data-testid$="--status-text"]')
		if (statusElement) {
			return
		}
		const link = card.querySelector<HTMLAnchorElement>("a")
		if (link?.href && !existingUrls.includes(link.href)) {
			selectedArticle.add(link.href)
		}
	})

	try {
		for (const article of selectedArticle) {
			const item = await fetchArticleDetails(article)
			await api.saveItem(item)
			await new Promise((resolve) => setTimeout(resolve, 5000))
		}
		selectedArticle.clear()
		const label = document.getElementById("vr-widget-label")!
		label.textContent = "Vinted Reupload"
		await renderStoredItems()
	} catch (error) {
		console.error("Erreur sauvegarde :", error)
		throw error
	}
}

export function updateWidgetCount() {
	const count = selectedArticle.size

	const label = document.getElementById("vr-widget-label")!

	label.textContent = count === 0 ? "Vinted Reupload" : `${count} article${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}`
}
