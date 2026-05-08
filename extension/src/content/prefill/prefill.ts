import { getPrefill, clearPrefill } from "../storage/storage"
import { waitForElement } from "../utils/dom"
import { fillReactInput, fillReactTextarea } from "./fillInputs"

export function handlePrefill() {
  if (window.location.pathname !== "/items/new") return

  getPrefill().then(({ pendingPrefill }) => {
    if (!pendingPrefill) return

    waitForElement('[data-testid="price-input--input"]').then(() => {
      fillReactInput('input[name="title"]', pendingPrefill.title)
      fillReactInput('[data-testid="price-input--input"]', String(pendingPrefill.price))
      fillReactTextarea('textarea[name="description"]', pendingPrefill.description ?? "")
      clearPrefill()
    })
  })
}
