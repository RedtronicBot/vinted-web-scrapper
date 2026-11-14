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

const CATEGORY_CONTENT = '[data-testid="catalog-select-dropdown-content"]'
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function pollFor<T>(check: () => T | null, timeout: number, interval = 150): Promise<T | null> {
	const start = Date.now()
	while (Date.now() - start < timeout) {
		const result = check()
		if (result) return result
		await pause(interval)
	}
	return null
}

function findCategoryCell(text: string): HTMLElement | null {
	const cells = Array.from(document.querySelectorAll(`${CATEGORY_CONTENT} .web_ui__Cell__title`))
	const cell = cells.find((el) => el.textContent?.trim() === text)
	if (!cell) return null
	return (cell.closest('[role="button"]') as HTMLElement) ?? (cell as HTMLElement)
}

export async function fillCategory(category: string[]) {
	const input = document.querySelector<HTMLElement>('[data-testid="catalog-select-dropdown-input"]')
	if (!input) throw new Error("Input catégorie introuvable")

	input.click()
	input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
	await waitForElement(CATEGORY_CONTENT)

	for (let i = 0; i < category.length; i++) {
		const label = category[i]
		const next = category[i + 1]
		// Pour le dernier niveau, il n'y a rien à attendre après le clic
		const advanced = () => (next ? findCategoryCell(next) : true)

		let ok = false
		for (let attempt = 0; attempt < 3 && !ok; attempt++) {
			const cell = await pollFor(() => findCategoryCell(label), 6000)
			if (!cell) break
			cell.click()
			ok = Boolean(await pollFor(advanced, 3000))
		}
		if (!ok) throw new Error(`Catégorie introuvable : ${label}`)
	}
	await pause(500)
}

const normBrand = (s: string) => s.replace(/[’‘`]/g, "'").trim().toLowerCase()

export async function fillBrand(brand: string) {
	const input = await waitForElement<HTMLInputElement>('[data-testid="brand-select-dropdown-input"]')
	const isSet = () => normBrand(input.value) === normBrand(brand)
	const menuOpen = () => document.querySelector('[data-testid="brand-select-dropdown-content"], [data-testid="brand-search--input"]')

	// Vinted peut pré-remplir la marque à partir du titre : on lui laisse quelques secondes
	if (await pollFor(() => (isSet() ? true : null), 3000)) return

	// On essaie d'ouvrir le menu avec un clic, puis avec la séquence complète d'événements souris
	for (const attempt of [0, 1]) {
		if (attempt === 0) {
			input.click()
		} else {
			input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
			input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }))
			input.click()
		}
		if (await pollFor(() => menuOpen() ?? (isSet() ? true : null), 3000)) break
	}

	if (isSet()) return
	if (!menuOpen()) {
		console.warn(
			"[Vinted Reupload] menu marque introuvable, testids contenant 'brand' ou 'search' :",
			[...document.querySelectorAll('[data-testid*="brand"], [data-testid*="search"]')].map((el) => el.getAttribute("data-testid")),
		)
		console.warn(
			"[Vinted Reupload] menu ouvert :",
			document.querySelector("[data-radix-popper-content-wrapper]")?.outerHTML.slice(0, 6000) ?? "aucun",
		)
		throw new Error("Menu marque introuvable")
	}

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
	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

	const input = await waitForElement<HTMLElement>('[data-testid^="category-size-"][data-testid$="-input"]')
	input.click()

	// Le menu est rendu dans un portail Radix, hors du formulaire
	const menu = await waitForElement<HTMLElement>('[data-testid^="category-size-"][data-testid$="-content"], [data-radix-popper-content-wrapper]')

	// "M / 38 / 10" -> ["M", "38", "10"], testés tels quels puis préfixés
	const tokens = size
		.split("/")
		.map((t) => t.trim())
		.filter(Boolean)
	const prefixes = ["", "FR ", "EU ", "UK ", "IT ", "US "]
	const candidates = tokens.flatMap((t) => prefixes.map((p) => `${p}${t}`.toLowerCase()))

	const clickable = 'button, [role="button"], [role="menuitem"], [role="option"], [role="radio"], [role="checkbox"], [tabindex]'
	const textOf = (el: Element) => (el.textContent ?? "").trim().replace(/\s+/g, " ").toLowerCase()

	const findOption = (): HTMLElement | undefined => {
		const nodes = Array.from(menu.querySelectorAll<HTMLElement>("*"))
		for (const wanted of candidates) {
			// l'élément le plus profond dont le texte est exactement la valeur voulue
			const el = nodes.find((n) => textOf(n) === wanted && !Array.from(n.children).some((c) => textOf(c) === wanted))
			if (!el) continue
			const target = el.closest<HTMLElement>(clickable)
			return target && target !== menu && menu.contains(target) ? target : el
		}
	}

	const tryClick = async (attempts: number): Promise<boolean> => {
		for (let i = 0; i < attempts; i++) {
			const option = findOption()
			if (option) {
				option.click()
				return true
			}
			await wait(300)
		}
		return false
	}

	let done = await tryClick(6)

	// Sinon, on essaie les autres systèmes de tailles proposés par les puces
	if (!done) {
		for (const system of ["EU", "UK", "FR", "IT", "US"]) {
			const chip = Array.from(menu.querySelectorAll<HTMLElement>("button, [role='button'], [role='radio']")).find(
				(b) => (b.textContent ?? "").trim() === system,
			)
			if (!chip) continue
			chip.click()
			await wait(300)
			if (await tryClick(2)) {
				done = true
				break
			}
		}
	}

	if (!done) throw new Error(`Taille introuvable : ${size}`)

	// Referme le menu s'il est resté ouvert
	await wait(300)
	if (document.querySelector("[data-radix-popper-content-wrapper]")) {
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
	}
}

export async function fillCondition(status: string) {
	const input = await waitForElement<HTMLElement>('[data-testid="category-condition-single-list-input"]')
	input.click()

	const content = await waitForElement('[data-testid="category-condition-single-list-content"]')

	const target = await pollFor(() => findByText(content, status), 3000)
	if (!target) {
		console.warn(`État introuvable : ${status}`, content.outerHTML.slice(0, 8000))
		throw new Error(`État introuvable : ${status}`)
	}
	target.click()
	await pause(200)
}

function findByText(container: Element, text: string): HTMLElement | null {
	const wanted = text.trim().toLowerCase()
	const norm = (el: Element) => (el.textContent ?? "").trim().replace(/\s+/g, " ").toLowerCase()
	const match = Array.from(container.querySelectorAll<HTMLElement>("*")).find(
		(n) => norm(n) === wanted && !Array.from(n.children).some((c) => norm(c) === wanted),
	)
	if (!match) return null
	return (
		match.closest<HTMLElement>('[role="button"], [role="menuitem"], [role="option"], [role="checkbox"], [role="radio"], button, label, li') ?? match
	)
}

export async function fillColor(color: string) {
	const input = await waitForElement<HTMLElement>('[data-testid="color-select-dropdown-input"]')
	input.click()

	const content = await waitForElement('[data-testid="color-select-dropdown-content"]')

	const colors = color
		.split(",")
		.map((c) => c.trim())
		.filter(Boolean)
		.slice(0, 2)

	let selected = 0
	for (const c of colors) {
		const target = await pollFor(() => findByText(content, c), 3000)
		if (!target) {
			console.warn(`Couleur introuvable : ${c}`, content.outerHTML.slice(0, 8000))
			continue
		}
		target.click()
		selected++
		await pause(200)
	}
	clickOutside()
	if (selected === 0 && colors.length > 0) throw new Error(`Couleur introuvable : ${color}`)
}

export async function fillMaterial(material: string) {
	if (!material) return

	const input = await waitForElement<HTMLElement>('[data-testid="category-material-multi-list-input"]')
	input.click()

	const content = await waitForElement('[data-testid="category-material-multi-list-content"]')

	const materials = material
		.split(",")
		.map((m) => m.trim())
		.filter(Boolean)

	let selected = 0
	for (const m of materials) {
		const target = await pollFor(() => findByText(content, m), 3000)
		if (!target) {
			console.warn(`Matériau introuvable : ${m}`, content.outerHTML.slice(0, 8000))
			continue
		}
		target.click()
		selected++
		await pause(200)
	}
	clickOutside()
	if (selected === 0) throw new Error(`Matériau introuvable : ${material}`)
}

function clickOutside() {
	const body = document.body

	body.dispatchEvent(
		new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
			view: window,
		}),
	)

	body.dispatchEvent(
		new MouseEvent("mouseup", {
			bubbles: true,
			cancelable: true,
			view: window,
		}),
	)

	body.dispatchEvent(
		new MouseEvent("click", {
			bubbles: true,
			cancelable: true,
			view: window,
		}),
	)
}

export async function fillDimensions(dimensions?: { width: string; length: string } | null) {
	if (!dimensions) return

	if (dimensions.width) {
		fillReactInput('[data-testid="measurement-width--input"]', dimensions.width)
	}

	if (dimensions.length) {
		fillReactInput('[data-testid="measurement-length--input"]', dimensions.length)
	}
}
