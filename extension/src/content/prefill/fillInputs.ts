import type { Photo } from "../../types"

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
		console.error("❌ Input file introuvable")
		return
	}

	const dataTransfer = new DataTransfer()
	validFiles.forEach((file) => dataTransfer.items.add(file))

	// Setter natif React
	const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "files")?.set
	if (nativeInputValueSetter) {
		nativeInputValueSetter.call(input, dataTransfer.files)
	} else {
		Object.defineProperty(input, "files", { value: dataTransfer.files, writable: true })
	}

	input.dispatchEvent(new Event("change", { bubbles: true }))
}
