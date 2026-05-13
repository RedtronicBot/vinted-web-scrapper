import type { VintedItem } from "../../types"

export async function fetchArticleDetails(
	url: string,
): Promise<Omit<VintedItem, "id" | "createdAt" | "photos"> & { photos: { src: string; position: number }[] }> {
	const response = await fetch(url)
	const html = await response.text()
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, "text/html")
	const titleRaw = doc.querySelector("h1")?.textContent ?? ""
	const parts = titleRaw
		.split("-")
		.map((part) => part.trim())
		.filter(Boolean)

	let title = titleRaw

	if (parts.length === 3) {
		title = `${parts[0]} - ${parts[2]} - ${parts[1]}`
	}
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
	console.log("🚀 ~ fetchArticleDetails ~ photosMap:", photosMap)
	const photos = Array.from(photosMap.values()).sort((a, b) => a.position - b.position)
	const breadcrumbItems = Array.from(doc.querySelectorAll(".breadcrumbs__item"))

	const breadcrumbTexts = breadcrumbItems.map((item) => item.querySelector("span")?.textContent?.trim() ?? "")

	const startsWithAccueil = breadcrumbTexts[0]?.toLowerCase() === "accueil"

	const category = breadcrumbTexts.slice(startsWithAccueil ? 1 : 0, -1).filter(Boolean)
	return { title, price, status, description, brand, size, color, photos, category, material }
}
