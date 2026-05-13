import type { Photo } from "../../types"
import { waitForElement } from "../utils/dom"

export function fillReactInput(selector: string, value: string) {
	const el = document.querySelector<HTMLInputElement>(selector)
	if (!el) return

	el.focus()
	el.value = ""

	for (const char of value) {
		el.value += char
		el.dispatchEvent(new Event("input", { bubbles: true }))
	}

	el.dispatchEvent(new Event("change", { bubbles: true }))
}

export function fillReactTextarea(selector: string, value: string) {
	const el = document.querySelector<HTMLTextAreaElement>(selector)
	if (!el) return
	const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set
	setter?.call(el, value)
	el.dispatchEvent(new Event("input", { bubbles: true }))
}

export async function fillPhotos(photos: Photo[]) {
	const sortedPhotos = [...photos].sort((a, b) => a.position - b.position)
	if (sortedPhotos.length > 1) {
		;[sortedPhotos[0], sortedPhotos[sortedPhotos.length - 1]] = [sortedPhotos[sortedPhotos.length - 1], sortedPhotos[0]]
	}
	const files = await Promise.all(
		sortedPhotos.map(async ({ filename }) => {
			const url = `${import.meta.env.VITE_API_URL}/uploads/${filename}`
			const res = await fetch(url)
			const blob = await res.blob()
			return new File([blob], filename, { type: blob.type })
		}),
	)

	const validFiles = files.filter(Boolean) as File[]
	if (validFiles.length === 0) return

	const input = document.querySelector<HTMLInputElement>('input[type="file"]')
	if (!input) {
		console.error("Input file introuvable")
		return
	}

	const dataTransfer = new DataTransfer()
	validFiles.forEach((file) => dataTransfer.items.add(file))

	const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "files")?.set
	if (nativeInputValueSetter) {
		nativeInputValueSetter.call(input, dataTransfer.files)
	} else {
		Object.defineProperty(input, "files", { value: dataTransfer.files, writable: true })
	}

	input.dispatchEvent(new Event("change", { bubbles: true }))
}

export async function fillCategory(category: string[]) {
	const input = document.querySelector<HTMLElement>('[data-testid="catalog-select-dropdown-input"]')
	if (!input) {
		console.error("Input catégorie introuvable")
		return
	}

	// Focus sur l'input pour afficher le dropdown
	input.click()
	input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))

	// Attend que le dropdown soit visible
	await waitForElement('[data-testid="catalog-select-dropdown-content"]')

	// Navigue niveau par niveau
	for (const label of category) {
		const cell = await waitForCellWithText(label)
		if (!cell) {
			console.error(`Catégorie introuvable : ${label}`)
			return
		}
		cell.click()
		// Petite pause entre chaque niveau pour laisser le DOM se mettre à jour
		await new Promise((resolve) => setTimeout(resolve, 300))
	}
	await new Promise((resolve) => setTimeout(resolve, 500))
}

async function waitForCellWithText(text: string): Promise<HTMLElement | null> {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			const cells = Array.from(document.querySelectorAll('[data-testid="catalog-select-dropdown-content"] .web_ui__Cell__title'))
			const cell = cells.find((el) => el.textContent?.trim() === text)
			if (cell) {
				clearInterval(interval)
				resolve((cell.closest('[role="button"]') as HTMLElement) ?? (cell as HTMLElement))
			}
		}, 300)
		setTimeout(() => {
			clearInterval(interval)
			resolve(null)
		}, 2000)
	})
}

export async function fillBrand(brand: string) {
	// Attend que le dropdown marque soit présent (affiché seulement après catégorie)
	const input = (await waitForElement('[data-testid="brand-select-dropdown-input"]')) as HTMLElement
	input.click()

	await waitForElement('[data-testid="brand-select-dropdown-content"]')

	// Stratégie 1 : cherche dans les suggestions directement
	const found = await findAndClickBrand(brand)
	if (found) return

	// Stratégie 2 : tape dans la barre de recherche
	const searchInput = document.querySelector<HTMLInputElement>('[data-testid="brand-search--input"]')
	if (!searchInput) return

	searchInput.focus()
	searchInput.value = brand
	searchInput.dispatchEvent(new Event("input", { bubbles: true }))

	// Attend les résultats puis clique sur le premier match exact ou le custom
	await new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			// Cherche un match exact en premier
			const exact = findAndClickBrand(brand)
			if (exact) {
				clearInterval(interval)
				resolve()
				return
			}

			// Sinon prend le custom "Utiliser X comme marque"
			const custom = document.querySelector<HTMLElement>("#custom-select-brand")
			if (custom) {
				clearInterval(interval)
				custom.click()
				resolve()
			}
		}, 300)
		setTimeout(() => {
			clearInterval(interval)
			resolve()
		}, 2000)
	})
}

function findAndClickBrand(brand: string): boolean {
	const cells = Array.from(document.querySelectorAll('[data-testid="brand-select-dropdown-content"] .web_ui__Cell__title'))
	const match = cells.find((el) => el.textContent?.trim().toLowerCase() === brand.toLowerCase())
	if (match) {
		const btn = match.closest('[role="button"]') as HTMLElement
		btn?.click()
		return true
	}
	return false
}

export async function fillSize(size: string) {
	const input = (await waitForElement('[data-testid^="category-size-"][data-testid$="-input"]')) as HTMLElement

	if (!input) {
		console.warn("Input taille introuvable")
		return
	}

	input.click()

	const dropdown = (await waitForElement('[data-testid^="category-size-"][data-testid$="-content"]')) as HTMLElement

	if (!dropdown) {
		console.warn("Dropdown taille introuvable")
		return
	}

	// Cherche toutes les options possibles
	const options = Array.from(dropdown.querySelectorAll<HTMLElement>('[role="checkbox"], [role="button"], .filter-grid__option'))

	const normalizedSize = size.trim().toLowerCase()

	const match = options.find((el) => {
		const text = el.getAttribute("aria-label") || el.textContent || ""

		return text.trim().toLowerCase() === normalizedSize
	})

	if (!match) {
		console.warn(`Taille introuvable : ${size}`)
		console.log(
			"Tailles disponibles :",
			options.map((o) => o.getAttribute("aria-label") || o.textContent?.trim()),
		)
		return
	}

	match.click()
}

export async function fillCondition(status: string) {
	const input = (await waitForElement('[data-testid="category-condition-single-list-input"]')) as HTMLElement
	input.click()

	await waitForElement('[data-testid="category-condition-single-list-content"]')

	const cells = Array.from(document.querySelectorAll('[data-testid="category-condition-single-list-content"] .web_ui__Cell__title'))

	const match = cells.find((el) => el.textContent?.trim() === status)

	if (!match) {
		console.warn(`État introuvable : ${status}`)
		return
	}

	const btn = match.closest('[role="button"]') as HTMLElement
	btn?.click()
}

export async function fillColor(color: string) {
	const input = (await waitForElement('[data-testid="color-select-dropdown-input"]')) as HTMLElement
	input.click()

	await waitForElement('[data-testid="color-select-dropdown-content"]')

	const colors = color
		.split(",")
		.map((c) => c.trim())
		.filter(Boolean)
		.slice(0, 2)

	for (const c of colors) {
		const cells = Array.from(document.querySelectorAll('[data-testid="color-select-dropdown-content"] .web_ui__Cell__title'))
		const match = cells.find((el) => el.textContent?.trim().toLowerCase() === c.toLowerCase())

		if (!match) {
			console.warn(`Couleur introuvable : ${c}`)
			continue
		}

		const btn = match.closest('[role="button"]') as HTMLElement
		btn?.click()

		await new Promise((resolve) => setTimeout(resolve, 200))
	}
}

export async function fillMaterial(material: string) {
	if (!material) return

	const input = (await waitForElement('[data-testid="category-material-multi-list-input"]')) as HTMLElement
	input.click()

	await waitForElement('[data-testid="category-material-multi-list-content"]')

	const materials = material
		.split(",")
		.map((m) => m.trim())
		.filter(Boolean)

	for (const m of materials) {
		const cells = Array.from(document.querySelectorAll('[data-testid="category-material-multi-list-content"] .web_ui__Cell__title'))
		const match = cells.find((el) => el.textContent?.trim().toLowerCase() === m.toLowerCase())

		if (!match) {
			console.warn(`Matériau introuvable : ${m}`)
			continue
		}

		const btn = match.closest('[role="button"]') as HTMLElement
		btn?.click()
		await new Promise((resolve) => setTimeout(resolve, 200))
	}
}
