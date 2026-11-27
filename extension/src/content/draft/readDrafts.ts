export const key = (s: string) =>
	s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&amp;/g, "&")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()

// Cartes "Brouillon" actuellement affichées sur la page du dressing
export function readDrafts() {
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
