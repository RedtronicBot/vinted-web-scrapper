import { showToast, waitForElement } from "../utils/dom"
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
import { api } from "../api/api"

export const setPrefill = (item: VintedItem) => chrome.storage.local.set({ pendingPrefill: item })

export const getPrefill = (): Promise<{ pendingPrefill?: VintedItem }> => chrome.storage.local.get("pendingPrefill")

export const clearPrefill = () => chrome.storage.local.remove("pendingPrefill")

// Article à préremplir : soit depuis un lien #vr=<id> (notification), soit depuis le bouton du widget
async function resolvePrefill(): Promise<VintedItem | undefined> {
	const match = window.location.hash.match(/^#vr=(\d+)$/)
	if (match) {
		console.log("[Vinted Reupload] lien #vr détecté, id", match[1])
		// On retire le hash pour qu'un rechargement ne relance pas le remplissage
		history.replaceState(null, "", window.location.pathname + window.location.search)
		try {
			const item = await api.getItem(Number(match[1]))
			console.log("[Vinted Reupload] article récupéré :", item.title)
			return item
		} catch (e) {
			console.error("[Vinted Reupload] impossible de récupérer l'article", e)
			return undefined
		}
	}
	const { pendingPrefill } = await getPrefill()
	console.log("[Vinted Reupload] prefill du widget :", pendingPrefill?.title ?? "aucun")
	return pendingPrefill
}

export function handlePrefill() {
	if (window.location.pathname !== "/items/new") return
	resolvePrefill().then((pendingPrefill) => {
		if (!pendingPrefill) return
		waitForElement('[data-testid="dropzone-overlay"]').then(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500))

			// Une étape qui échoue ne bloque pas les suivantes, mais elle est comptée
			const failed: string[] = []
			const step = async (name: string, fn: () => unknown) => {
				try {
					await fn()
					console.log(`[Vinted Reupload] étape OK : ${name}`)
				} catch (e) {
					failed.push(name)
					console.warn(`[Vinted Reupload] étape "${name}" échouée :`, e)
				}
			}

			await step("titre", () => fillReactInput('input[name="title"]', pendingPrefill.title))
			await step("description", () => fillReactTextarea('textarea[name="description"]', pendingPrefill.description ?? ""))
			await step("photos", () => fillPhotos(pendingPrefill.photos))

			// Les autres champs n'apparaissent qu'une fois la catégorie choisie
			const hasCategory = Array.isArray(pendingPrefill.category) && pendingPrefill.category.length > 0
			if (hasCategory) {
				await step("catégorie", async () => {
					await waitForElement('[data-testid="catalog-select-dropdown-input"]')
					await fillCategory(pendingPrefill.category)
				})
			} else {
				console.warn("[Vinted Reupload] catégorie absente de l'article")
				showToast("Choisis la catégorie : le reste se remplira ensuite")
			}

			await step("marque", async () => {
				await waitForElement('[data-testid="brand-select-dropdown-input"]', hasCategory ? 15000 : 120000)
				await fillBrand(pendingPrefill.brand)
			})
			await step("taille", async () => {
				await waitForElement('[data-testid^="category-size-"][data-testid$="-input"]')
				await fillSize(pendingPrefill.size)
			})
			await step("état", async () => {
				await waitForElement('[data-testid="category-condition-single-list-input"]')
				await fillCondition(pendingPrefill.status)
			})
			await step("couleur", async () => {
				await waitForElement('[data-testid="color-select-dropdown-input"]')
				await fillColor(pendingPrefill.color)
			})
			await step("matériau", async () => {
				if (!pendingPrefill.material) return
				await waitForElement('[data-testid="category-material-multi-list-input"]')
				await fillMaterial(pendingPrefill.material)
			})
			await step("dimensions", () => fillDimensions(pendingPrefill.dimensions))
			await step("prix", () => fillReactInput('[data-testid="price-input--input"]', String(pendingPrefill.price)))

			if (failed.length > 0) {
				alert(`Vinted Reupload : remplissage incomplet (${failed.join(", ")}). Termine à la main, l'article reste dans ta liste.`)
				return
			}

			clearPrefill()
			const draftBtn = await waitForElement<HTMLElement>('[data-testid="upload-form-save-draft-button"]')
			draftBtn.click()

			await chrome.storage.local.set({ pendingDraft: { itemId: pendingPrefill.id, title: pendingPrefill.title } })
		})
	})
}
