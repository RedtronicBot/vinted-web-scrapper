// Lecture d'un brouillon Vinted depuis sa page d'édition (/items/<id>/edit), à appeler dans le content script

export type DraftData = {
	draftId: string
	title: string
	description: string
	price: string
	brand: string
	status: string
	size: string
	color: string
	material: string
	category: string[]
	dimensions: { width: string; length: string } | null
	photos: { src: string; position: number }[]
}

type CatalogNode = { id: number; title: string; catalogs?: CatalogNode[] }

export const isDraftEditPage = () => /^\/items\/\d+\/edit\/?$/.test(window.location.pathname)

const value = (selector: string) => document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)?.value.trim() ?? ""

// Un brouillon a toujours un titre : tant qu'il est vide, React n'a pas fini de remplir le formulaire
async function waitForTitle(timeout = 15000) {
	const start = Date.now()
	while (Date.now() - start < timeout) {
		if (value('[data-testid="title--input"]')) return
		await new Promise((r) => setTimeout(r, 250))
	}
	throw new Error("formulaire du brouillon non chargé (titre vide)")
}

/* ------------------------- Données embarquées par Next ------------------------- */

// Les scripts contiennent des self.__next_f.push([1,"..."]) : chaque morceau est une chaîne JS échappée.
// On les décode puis on les met bout à bout, un objet JSON pouvant être coupé entre deux morceaux.
const FLIGHT_CHUNK = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g

function readFlightText(): string {
	let out = ""
	for (const script of Array.from(document.scripts)) {
		const text = script.textContent ?? ""
		if (!text.includes("__next_f")) continue
		for (const m of text.matchAll(FLIGHT_CHUNK)) {
			try {
				out += JSON.parse(m[1]) as string
			} catch {
				// morceau illisible : on l'ignore
			}
		}
	}
	return out
}

// Extrait l'objet ou le tableau JSON qui commence à l'index `start` (accolades équilibrées, chaînes ignorées)
function extractJson<T>(text: string, start: number): T {
	const open = text[start]
	const close = open === "{" ? "}" : "]"
	let depth = 0
	let inString = false
	let escaped = false
	for (let i = start; i < text.length; i++) {
		const ch = text[i]
		if (inString) {
			if (escaped) escaped = false
			else if (ch === "\\") escaped = true
			else if (ch === '"') inString = false
		} else if (ch === '"') inString = true
		else if (ch === open) depth++
		else if (ch === close && --depth === 0) return JSON.parse(text.slice(start, i + 1)) as T
	}
	throw new Error("JSON incomplet dans les données de la page")
}

function readAfter<T>(text: string, marker: string): T {
	const index = text.indexOf(marker)
	if (index === -1) throw new Error(`${marker} introuvable dans la page`)
	return extractJson<T>(text, index + marker.length)
}

function findPath(nodes: CatalogNode[], id: number, path: string[] = []): string[] | null {
	for (const node of nodes) {
		const current = [...path, node.title]
		if (node.id === id) return current
		const found = findPath(node.catalogs ?? [], id, current)
		if (found) return found
	}
	return null
}

function readCategory(): string[] {
	const text = readFlightText()
	const model = readAfter<{ catalogId?: number }>(text, '"itemEditModel":')
	if (!model.catalogId) return []
	const tree = readAfter<CatalogNode[]>(text, '"tree":')
	return findPath(tree, model.catalogId) ?? []
}

/* ------------------------------- Lecture du formulaire ------------------------------- */

function readPrice(): string {
	const n = parseFloat(value('[data-testid="price-input--input"]').replace(/\s/g, "").replace(",", "."))
	return Number.isFinite(n) ? String(n) : "0"
}

function readDimensions(): DraftData["dimensions"] {
	const width = value('[data-testid="measurement-width--input"]')
	const length = value('[data-testid="measurement-length--input"]')
	return width || length ? { width, length } : null
}

function readPhotos(): DraftData["photos"] {
	const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img[data-testid^="media-select-photo-"][data-testid$="--img"]'))
	return imgs.filter((img) => /^https?:/.test(img.src)).map((img, i) => ({ src: img.src, position: i + 1 }))
}

export async function readDraftFromPage(): Promise<DraftData> {
	const draftId = window.location.pathname.match(/^\/items\/(\d+)\/edit/)?.[1]
	if (!draftId) throw new Error("ce n'est pas une page de brouillon")

	await waitForTitle()

	let category: string[] = []
	try {
		category = readCategory()
	} catch (e) {
		// la catégorie manquante ne doit pas faire perdre le reste du brouillon
		console.warn("[Vinted Reupload] catégorie du brouillon illisible", e)
	}

	return {
		draftId,
		title: value('[data-testid="title--input"]'),
		description: value('[data-testid="description--input"]'),
		price: readPrice(),
		brand: value('[data-testid="brand-select-dropdown-input"]'),
		status: value('[data-testid="category-condition-single-list-input"]'),
		size: value('[data-testid^="category-size-"][data-testid$="-input"]'),
		color: value('[data-testid="color-select-dropdown-input"]'),
		material: value('[data-testid="category-material-multi-list-input"]'),
		category,
		dimensions: readDimensions(),
		photos: readPhotos(),
	}
}
