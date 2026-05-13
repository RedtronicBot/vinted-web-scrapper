import { selectedArticle, updateWidgetCount } from "./selection"

export function injectCheckboxes() {
	const cards = document.querySelectorAll<HTMLElement>('[data-testid^="product-item-id-"]')

	cards.forEach((card) => {
		if (card.querySelector(".vr-checkbox")) return

		const link = card.querySelector<HTMLAnchorElement>("a")

		const match = link?.href.match(/\/items\/(\d+)/)

		const itemId = match?.[1]

		if (!itemId) return

		card.style.position = "relative"

		// checkbox
		const checkbox = document.createElement("input")
		checkbox.type = "checkbox"
		checkbox.className = "vr-checkbox"
		checkbox.dataset.itemId = itemId

		const checkboxId = `vr-checkbox-${itemId}`
		checkbox.id = checkboxId

		// overlay label
		const overlay = document.createElement("label")
		overlay.htmlFor = checkboxId
		overlay.className = "vr-checkbox-overlay"

		checkbox.addEventListener("change", () => {
			if (checkbox.checked) {
				selectedArticle.add(link?.href ?? "")
				card.classList.add("vr-selected")
			} else {
				selectedArticle.delete(link?.href ?? "")
				card.classList.remove("vr-selected")
			}

			updateWidgetCount()
		})

		card.appendChild(overlay)
		card.appendChild(checkbox)
	})
}
