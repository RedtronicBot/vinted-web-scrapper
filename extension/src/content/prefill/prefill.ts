import { waitForElement } from "../utils/dom"
import { fillCategory, fillPhotos, fillReactInput, fillReactTextarea } from "./fillInputs"
import type { VintedItem } from "../../types"

export const setPrefill = (item: VintedItem) => chrome.storage.local.set({ pendingPrefill: item })

export const getPrefill = (): Promise<{ pendingPrefill?: VintedItem }> => chrome.storage.local.get("pendingPrefill")

export const clearPrefill = () => chrome.storage.local.remove("pendingPrefill")
export function handlePrefill() {
	if (window.location.pathname !== "/items/new") return
	getPrefill().then(({ pendingPrefill }) => {
		if (!pendingPrefill) return
		waitForElement('[data-testid="dropzone-overlay"]').then(async () => {
			fillReactInput('input[name="title"]', pendingPrefill.title)
			fillReactInput('[data-testid="price-input--input"]', String(pendingPrefill.price))
			fillReactTextarea('textarea[name="description"]', pendingPrefill.description ?? "")
			await fillPhotos(pendingPrefill.photos)
			await fillCategory(pendingPrefill.category)
			clearPrefill()
		})
	})
}
