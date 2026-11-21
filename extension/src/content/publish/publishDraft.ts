import { api } from "../api/api"
import { showToast, waitForElement } from "../utils/dom"
import type { PendingAdd } from "./afterPublish"

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Page attendue : /items/<draftId>/edit#vr-publish=<itemId>
export async function handlePublish() {
	const draftIdInUrl = window.location.pathname.match(/^\/items\/(\d+)\/edit$/)?.[1]
	const itemId = window.location.hash.match(/^#vr-publish=(\d+)$/)?.[1]
	if (!draftIdInUrl || !itemId) return

	// On retire le fragment : un rechargement ne doit pas republier
	history.replaceState(null, "", window.location.pathname + window.location.search)

	try {
		// Garde-fou : on ne publie que si la base confirme que c'est bien CE brouillon
		const item = await api.getItem(Number(itemId))
		if (item.stage !== "DRAFT" || item.draftId !== draftIdInUrl) {
			console.warn("[Vinted Reupload] publication ignorée : brouillon non concordant", { item, draftIdInUrl })
			return
		}

		const saveBtn = await waitForElement<HTMLElement>('[data-testid="upload-form-save-button"]', 20000)
		await pause(3000) // laisse le formulaire finir de se charger

		// Noté AVANT le clic : après la publication Vinted redirige et cette page est déchargée
		const pendingAdd: PendingAdd = { itemId: Number(itemId), draftId: draftIdInUrl, at: Date.now() }
		await chrome.storage.local.set({ pendingAdd })
		saveBtn.click()

		await api.setStage(Number(itemId), "PUBLISHED")
		console.log("[Vinted Reupload] article publié, stage PUBLISHED")
	} catch (e) {
		console.warn("[Vinted Reupload] publication automatique impossible", e)
		showToast("Vinted Reupload : clique sur « Ajouter » toi-même pour publier")
	}
}
