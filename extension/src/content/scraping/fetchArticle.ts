import type { VintedItem } from "../../types"

export async function fetchArticleDetails(
	url: string,
): Promise<Omit<VintedItem, "id" | "createdAt" | "photos"> & { photos: { src: string; position: number }[] }> {
	const response = await fetch(url)
	const html = await response.text()
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, "text/html")
	const title = doc.querySelector("h1")?.textContent ?? ""
	const rawPrice = doc.querySelector('[data-testid="item-price"]')?.textContent ?? ""
	const price = rawPrice.replace(/[^\d,]/g, "").replace(",", ".")
	const status = doc.querySelector('[itemprop="status"]')?.textContent ?? ""
	const description = doc.querySelector('[itemprop="description"]')?.textContent ?? ""
	const brand = doc.querySelector('[itemprop="name"]')?.textContent ?? ""
	const size = doc.querySelector('[data-testid="item-attributes-size"] .details-list__item-value:last-child')?.textContent?.trim() ?? ""
	const color = doc.querySelector('[data-testid="item-attributes-color"] .details-list__item-value:last-child')?.textContent?.trim() ?? ""
	const material = doc.querySelector('[data-testid="item-attributes-material"] .details-list__item-value:last-child')?.textContent?.trim() ?? ""
	const photosMap = new Map<number, { src: string; position: number }>()

	Array.from(doc.querySelectorAll("figure[class*='item-photo--']")).forEach((figure) => {
		const img = figure.querySelector("img")
		if (!img) return

		const positionClass = Array.from(figure.classList).find((c) => /^item-photo--\d+$/.test(c))
		const position = positionClass ? parseInt(positionClass.split("--")[1]) : 0
		const src = (img as HTMLImageElement).src

		if (src && !photosMap.has(position)) {
			photosMap.set(position, { src, position })
		}
	})

	const photos = Array.from(photosMap.values()).sort((a, b) => a.position - b.position)
	const breadcrumbItems = Array.from(doc.querySelectorAll(".breadcrumbs__item"))
	const category = breadcrumbItems
		.slice(1, -1)
		.map((item) => item.querySelector("span")?.textContent?.trim() ?? "")
		.filter(Boolean)
	return { title, price, status, description, brand, size, color, photos, category, material }
}
