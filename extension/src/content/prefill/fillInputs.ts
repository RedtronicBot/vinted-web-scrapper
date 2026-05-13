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

export async function fillPhotos(photos: { filename: string }[]) {
	const dropzone = document.querySelector('[data-testid="dropzone-overlay"]')?.parentElement
	if (!dropzone) return

	const files = await Promise.all(
		photos.map(async ({ filename }) => {
			const url = `${import.meta.env.VITE_API_URL}/uploads/${filename}`
			const res = await fetch(url)
			const blob = await res.blob()
			return new File([blob], filename, { type: blob.type })
		}),
	)

	const dataTransfer = new DataTransfer()
	files.forEach((file) => dataTransfer.items.add(file))

	dropzone.dispatchEvent(new DragEvent("dragenter", { bubbles: true }))
	dropzone.dispatchEvent(new DragEvent("dragover", { bubbles: true }))
	dropzone.dispatchEvent(
		new DragEvent("drop", {
			bubbles: true,
			dataTransfer,
		}),
	)
}
