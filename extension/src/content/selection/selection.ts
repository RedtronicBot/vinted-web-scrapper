import type { VintedItem } from "../../types"
import { fetchArticleDetails } from "../scraping/fetchArticle"
import { renderStoredItems } from "../widget/widget.render"
import { injectCheckboxes } from "./checkboxes"

let selectionMode = false
export const selectedArticle = new Set<string>()

export function startSelectionMode() {
  if (selectionMode) return
  selectionMode = true

  // Change le widget en mode sélection
  const btn = document.getElementById("vr-widget-btn")!
  btn.textContent = "✓ Terminer"
  btn.style.background = "#1a1a1a"

  injectCheckboxes()
}

export async function finishSelection() {
  for (const article of selectedArticle) {
    const item = await fetchArticleDetails(article)
    const { vintedItems } = await chrome.storage.local.get("vintedItems")
    const existing = (vintedItems ?? []) as VintedItem[]

    await chrome.storage.local.set({
      vintedItems: [...existing, item],
    })
  }

  const btn = document.getElementById("vr-widget-btn")!
  btn.textContent = "+ Ajouter un article"
  btn.style.background = "#09b1ba"

  document.querySelectorAll(".vr-checkbox").forEach((el) => el.remove())

  selectionMode = false
  selectedArticle.clear()

  const label = document.getElementById("vr-widget-label")!
  label.textContent = "Vinted Reupload"
  await renderStoredItems()
}

export function updateWidgetCount() {
  const count = selectedArticle.size
  const label = document.getElementById("vr-widget-label")!
  label.textContent = count === 0 ? "Vinted Reupload" : `${count} article${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}`
}
