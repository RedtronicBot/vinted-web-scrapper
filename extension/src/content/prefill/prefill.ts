import { waitForElement } from "../utils/dom"
import {
	fillBrand,
	fillCategory,
	fillColor,
	fillCondition,
	fillDimensions,
	fillMaterial,
	fillPhotos,
	fillReactInput,
	fillReactTextarea,
	fillSize,
} from "./fillInputs"
import type { VintedItem } from "../../types"

export const setPrefill = (item: VintedItem) => chrome.storage.local.set({ pendingPrefill: item })

export const getPrefill = (): Promise<{ pendingPrefill?: VintedItem }> => chrome.storage.local.get("pendingPrefill")

export const clearPrefill = () => chrome.storage.local.remove("pendingPrefill")

export function handlePrefill() {
	if (window.location.pathname !== "/items/new") return
	getPrefill().then(({ pendingPrefill }) => {
		if (!pendingPrefill) return
		waitForElement('[data-testid="dropzone-overlay"]').then(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500))
			fillReactInput('input[name="title"]', pendingPrefill.title)
			fillReactTextarea('textarea[name="description"]', pendingPrefill.description ?? "")

			await fillPhotos(pendingPrefill.photos)

			await waitForElement('[data-testid="catalog-select-dropdown-input"]')
			await fillCategory(pendingPrefill.category)

			await waitForElement('[data-testid="brand-select-dropdown-input"]')
			await fillBrand(pendingPrefill.brand)

			await waitForElement('[data-testid="category-size-single-grid-input"]')
			await fillSize(pendingPrefill.size)

			await waitForElement('[data-testid="category-condition-single-list-input"]')
			await fillCondition(pendingPrefill.status)

			await waitForElement('[data-testid="color-select-dropdown-input"]')
			await fillColor(pendingPrefill.color)

			await waitForElement('[data-testid="category-material-multi-list-input"]')
			await fillMaterial(pendingPrefill.material ?? "")
			await fillDimensions(pendingPrefill.dimensions)
			await fillReactInput('[data-testid="price-input--input"]', String(pendingPrefill.price))
			clearPrefill()
		})
	})
}
