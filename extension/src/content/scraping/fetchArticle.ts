import type { VintedItem } from "../../types"
import { extractCategory } from "./fetchCategory"

export async function fetchArticleDetails(
	url: string,
): Promise<Omit<VintedItem, "id" | "createdAt" | "photos"> & { photos: { src: string; position: number }[] }> {
	const response = await fetch(url)
	const html = await response.text()
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, "text/html")
	const titleRaw = doc.querySelector("h1")?.textContent ?? ""
	const parts = titleRaw
		.split(/\s*[–-]\s*/)
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
	const dimensionsRaw =
		doc.querySelector('[data-testid="item-attributes-measurements"] .details-list__item-value:last-child')?.textContent?.trim() ?? ""
	const dimensionMatch = dimensionsRaw.match(/l\s*(\d+)\s*cm\s*\/\s*L\s*(\d+)\s*cm/i)
	const dimensions = dimensionMatch ? { width: dimensionMatch[1], length: dimensionMatch[2] } : null
	const size = doc.querySelector('[data-testid="item-attributes-size"] .details-list__item-value:last-child')?.textContent?.trim() ?? ""
	const color = doc.querySelector('[data-testid="item-attributes-color"] .details-list__item-value:last-child')?.textContent?.trim() ?? ""
	const material = doc.querySelector('[data-testid="item-attributes-material"] .details-list__item-value:last-child')?.textContent?.trim() ?? ""
	const { photos, category: liveCategory } = await chrome.runtime.sendMessage({ type: "SCRAPE_ARTICLE", url })
	const category: string[] = liveCategory?.length ? liveCategory : extractCategory(doc)
	console.log("[Vinted Reupload] catégorie scrapée :", category, liveCategory?.length ? "(onglet)" : "(HTML)")
	const uploadDateRaw = doc.querySelector('[itemprop="upload_date"] span')?.textContent?.trim() ?? ""
	const reuploadAt = parseReuploadAt(uploadDateRaw)
	return {
		title,
		price,
		status,
		description,
		brand,
		size,
		color,
		photos,
		category,
		material,
		dimensions,
		reuploadAt: reuploadAt.toISOString(),
		sourceUrl: url,
	}
}

function parseReuploadAt(text: string): Date {
	const now = new Date()
	const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
	if (!text) return midnight
	// "Il y a X jours" / "Il y a X semaines" / "Il y a X mois"
	const daysMatch = text.match(/il y a (\d+) jour/i)
	const weeksMatch = text.match(/il y a\s+(\d+|une)\s+semaine[s]?/i)
	const monthsMatch = text.match(/il y a (\d+) mois/i)

	let daysAgo = 0
	if (daysMatch) daysAgo = parseInt(daysMatch[1])
	else if (weeksMatch) {
		const val = weeksMatch[1]
		daysAgo = val === "une" ? 7 : parseInt(val) * 7
	} else if (monthsMatch) daysAgo = parseInt(monthsMatch[1]) * 30

	if (daysAgo >= 7) {
		// Déjà à réuploader — date d'aujourd'hui minuit
		return midnight
	}

	// Calcule dans combien de jours (arrondi au supérieur)
	const daysLeft = Math.ceil(7 - daysAgo)
	const reuploadAt = new Date(midnight)
	reuploadAt.setDate(midnight.getDate() + daysLeft)
	return reuploadAt
}
