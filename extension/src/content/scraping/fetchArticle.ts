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
	const photos = Array.from(doc.querySelectorAll(".item-photos img")).map((img) => {
		const figure = img.closest("figure")
		const positionClass = Array.from(figure?.classList ?? []).find((c) => /^item-photo--\d+$/.test(c))
		const position = positionClass ? parseInt(positionClass.split("--")[1]) : 0
		return {
			src: (img as HTMLImageElement).src,
			position,
		}
	})
	return { title, price, status, description, brand, size, color, photos }
}
