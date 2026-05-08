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

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.className = "vr-checkbox"
    checkbox.dataset.itemId = itemId

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedArticle.add(link?.href ?? "")
      else selectedArticle.delete(link?.href ?? "")
      updateWidgetCount()
    })

    card.appendChild(checkbox)
  })
}
