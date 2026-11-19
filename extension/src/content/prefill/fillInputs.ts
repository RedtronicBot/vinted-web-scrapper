import type { Photo } from "../../types"
import { waitForElement } from "../utils/dom"

/* -------------------------------------------------------------------------- */
/*  Champs simples                                                            */
/* -------------------------------------------------------------------------- */

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

export async function fillDimensions(dimensions?: { width: string; length: string } | null) {
	if (!dimensions) return

	if (dimensions.width) {
		fillReactInput('[data-testid="measurement-width--input"]', dimensions.width)
	}

	if (dimensions.length) {
		fillReactInput('[data-testid="measurement-length--input"]', dimensions.length)
	}
}

/* -------------------------------------------------------------------------- */
/*  Outils pour les menus déroulants                                          */
/*  Vinted a deux versions : anciens <input> et nouveaux <button> (Radix)      */
/* -------------------------------------------------------------------------- */

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

const normText = (s: string) =>
	s
		.replace(/\u00a0/g, " ")
		.replace(/[’‘`]/g, "'")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase()

// Trouve l'élément cliquable dont le texte est exactement `text`
function findByText(container: Element, text: string): HTMLElement | null {
	const wanted = normText(text)
	const match = Array.from(container.querySelectorAll<HTMLElement>("*")).find(
		(n) => normText(n.textContent ?? "") === wanted && !Array.from(n.children).some((c) => normText(c.textContent ?? "") === wanted),
	)
	if (!match) return null
	const target = match.closest<HTMLElement>(
		'[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="button"], [role="option"], [role="checkbox"], [role="radio"], button, label, li',
	)
	return target && container.contains(target) ? target : match
}

// Valeur affichée : ancien composant (<input>) ou nouveau (<button> + <span ...--value>)
function readDropdownValue(trigger: HTMLElement): string {
	if (trigger instanceof HTMLInputElement) return trigger.value
	return (trigger.querySelector<HTMLElement>('[data-testid$="--value"]')?.textContent ?? "").trim()
}

function setNativeValue(el: HTMLInputElement, value: string) {
	Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, value)
	el.dispatchEvent(new Event("input", { bubbles: true }))
}

// Les menus Radix s'ouvrent sur pointerdown : on envoie toute la séquence souris
function pointerClick(el: HTMLElement) {
	const base = { bubbles: true, cancelable: true, view: window, button: 0 }
	const pointer = { pointerId: 1, pointerType: "mouse", isPrimary: true }
	el.dispatchEvent(new PointerEvent("pointerdown", { ...base, ...pointer, buttons: 1 }))
	el.dispatchEvent(new MouseEvent("mousedown", { ...base, buttons: 1 }))
	el.dispatchEvent(new PointerEvent("pointerup", { ...base, ...pointer, buttons: 0 }))
	el.dispatchEvent(new MouseEvent("mouseup", { ...base, buttons: 0 }))
	el.dispatchEvent(new MouseEvent("click", { ...base, buttons: 0 }))
}

// Retrouve le menu ouvert pour un déclencheur, ancien ou nouveau composant
function findMenu(trigger: HTMLElement): HTMLElement | null {
	const controls = trigger.getAttribute("aria-controls")
	if (controls) {
		const byId = document.getElementById(controls)
		if (byId) return byId
	}
	const legacy = trigger.dataset.testid?.replace(/-input$/, "-content")
	if (legacy) {
		const el = document.querySelector<HTMLElement>(`[data-testid="${legacy}"]`)
		if (el) return el
	}
	const popups = document.querySelectorAll<HTMLElement>('[data-radix-popper-content-wrapper], [role="menu"], [role="listbox"]')
	return popups.length ? popups[popups.length - 1] : null
}

async function openMenu(trigger: HTMLElement): Promise<HTMLElement> {
	for (let attempt = 0; attempt < 3; attempt++) {
		if (trigger.getAttribute("aria-expanded") !== "true") pointerClick(trigger)
		const menu = await pollFor(() => findMenu(trigger), 2500)
		if (menu) return menu
	}
	throw new Error(`Menu introuvable : ${trigger.dataset.testid}`)
}

function closeMenu(trigger: HTMLElement) {
	if (trigger.getAttribute("aria-expanded") === "true") {
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }))
	} else {
		clickOutside()
	}
}

function clickOutside() {
	const body = document.body

	body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }))
	body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }))
	body.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }))
}

// État, couleur, matériau : même logique, seuls le déclencheur et les libellés changent
async function selectFromMenu(triggerSelector: string, labels: string[], multi = false) {
	if (labels.length === 0) return
	const trigger = await waitForElement<HTMLElement>(triggerSelector)
	const menu = await openMenu(trigger)

	let selected = 0
	for (const label of labels) {
		const target = await pollFor(() => {
			const m = findMenu(trigger)
			return m ? findByText(m, label) : null
		}, 3000)
		if (!target) {
			console.warn(`[Vinted Reupload] option introuvable : ${label}`, (findMenu(trigger) ?? menu).outerHTML.slice(0, 8000))
			continue
		}
		target.click()
		selected++
		await pause(250)
		if (!multi) break
	}
	closeMenu(trigger)
	if (selected === 0) throw new Error(`Option introuvable : ${labels.join(", ")}`)
}

const splitList = (value: string) =>
	value
		.split(",")
		.map((v) => v.trim())
		.filter(Boolean)

/* -------------------------------------------------------------------------- */
/*  Menus déroulants                                                          */
/* -------------------------------------------------------------------------- */

export async function fillCategory(category: string[]) {
	const trigger = await waitForElement<HTMLElement>('[data-testid="catalog-select-dropdown-input"]')
	await openMenu(trigger)

	const cellIn = (label: string) => {
		const menu = findMenu(trigger)
		return menu ? findByText(menu, label) : null
	}

	// Navigue niveau par niveau, en vérifiant que le menu change bien de niveau après chaque clic
	for (let i = 0; i < category.length; i++) {
		const label = category[i]
		const next = category[i + 1]
		const advanced = () => (next ? cellIn(next) : true)

		let ok = false
		for (let attempt = 0; attempt < 3 && !ok; attempt++) {
			const cell = await pollFor(() => cellIn(label), 6000)
			if (!cell) break
			cell.click()
			ok = Boolean(await pollFor(advanced, 3000))
		}
		if (!ok) {
			console.warn(`[Vinted Reupload] catégorie introuvable : ${label}`, findMenu(trigger)?.outerHTML.slice(0, 8000))
			throw new Error(`Catégorie introuvable : ${label}`)
		}
	}
	await pause(500)
}

export async function fillBrand(brand: string) {
	const trigger = await waitForElement<HTMLElement>('[data-testid="brand-select-dropdown-input"]')
	const isSet = () => normText(readDropdownValue(trigger)) === normText(brand)

	// Vinted peut pré-remplir la marque à partir du titre : on lui laisse un peu de temps
	if (await pollFor(() => (isSet() ? true : null), 2500)) return

	await openMenu(trigger)
	const optionIn = () => {
		const menu = findMenu(trigger)
		return menu ? findByText(menu, brand) : null
	}

	// Stratégie 1 : la marque est dans les suggestions
	let option = await pollFor(optionIn, 1500)

	// Stratégie 2 : on tape dans le champ de recherche du menu
	if (!option) {
		const search = findMenu(trigger)?.querySelector<HTMLInputElement>("input:not([type=hidden])")
		if (search) {
			search.focus()
			setNativeValue(search, brand)
			option = await pollFor(optionIn, 4000)
		}
	}

	if (!option) {
		console.warn("[Vinted Reupload] marque introuvable", findMenu(trigger)?.outerHTML.slice(0, 8000))
		throw new Error(`Marque introuvable : ${brand}`)
	}
	option.click()
	await pause(300)
	closeMenu(trigger)
}

export async function fillSize(size: string) {
	const trigger = await waitForElement<HTMLElement>('[data-testid^="category-size-"][data-testid$="-input"]')
	const openedMenu = await openMenu(trigger)
	const currentMenu = () => findMenu(trigger) ?? openedMenu

	// "M / 38 / 10" -> ["M", "38", "10"], testés tels quels puis préfixés (FR 38, EU 38...)
	const tokens = size
		.split("/")
		.map((t) => t.trim())
		.filter(Boolean)
	const prefixes = ["", "FR ", "EU ", "UK ", "IT ", "US "]
	const candidates = tokens.flatMap((t) => prefixes.map((p) => `${p}${t}`))

	const findOption = (): HTMLElement | null => {
		const menu = currentMenu()
		for (const wanted of candidates) {
			const option = findByText(menu, wanted)
			if (option) return option
		}
		return null
	}

	const tryClick = async (timeout: number): Promise<boolean> => {
		const option = await pollFor(findOption, timeout)
		if (!option) return false
		option.click()
		return true
	}

	let done = await tryClick(2000)

	// Sinon, on essaie les autres systèmes de tailles proposés par les puces
	if (!done) {
		for (const system of ["EU", "UK", "FR", "IT", "US"]) {
			const chip = Array.from(currentMenu().querySelectorAll<HTMLElement>("button, [role='button'], [role='radio']")).find(
				(b) => (b.textContent ?? "").trim() === system,
			)
			if (!chip) continue
			chip.click()
			await pause(300)
			if (await tryClick(1000)) {
				done = true
				break
			}
		}
	}

	if (!done) {
		console.warn(`[Vinted Reupload] taille introuvable : ${size}`, currentMenu().outerHTML.slice(0, 8000))
		throw new Error(`Taille introuvable : ${size}`)
	}

	await pause(300)
	closeMenu(trigger)
}

export const fillCondition = (status: string) => selectFromMenu('[data-testid="category-condition-single-list-input"]', [status])

export const fillColor = (color: string) => selectFromMenu('[data-testid="color-select-dropdown-input"]', splitList(color).slice(0, 2), true)

export const fillMaterial = (material: string) => selectFromMenu('[data-testid="category-material-multi-list-input"]', splitList(material), true)
