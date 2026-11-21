import { api } from "../api/api"
import { fetchArticleDetails } from "../scraping/fetchArticle"
import { getCards, hasStatus } from "../selection/selection"
import { showToast, waitForElement } from "../utils/dom"
import { renderStoredItems } from "../widget/widget.render"

export type PendingAdd = { itemId: number; draftId: string; at: number }

// Au-delà, on considère que la publication n'a pas abouti et on n'agit pas
const MAX_AGE = 3 * 60 * 1000

// Page /member/ après la publication : remplace l'ancien article de la base par le nouveau
export async function addPublishedIfPending() {
	const { pendingAdd } = (await chrome.storage.local.get("pendingAdd")) as { pendingAdd?: PendingAdd }
	if (!pendingAdd) return

	// Retiré avant d'agir : en cas de souci, on ne reboucle jamais
	await chrome.storage.local.remove("pendingAdd")
	if (Date.now() - pendingAdd.at > MAX_AGE) return

	try {
		await waitForElement('[data-testid^="product-item-id-"]', 15000)
		const cards = getCards()

		// Le brouillon publié garde normalement son id : on le préfère, sinon on prend le premier article de la liste
		const card = cards.find((c) => c.dataset.testid === `product-item-id-${pendingAdd.draftId}`) ?? cards.find((c) => !hasStatus(c))
		const url = card?.querySelector<HTMLAnchorElement>("a")?.href
		if (!url) throw new Error("aucun article trouvé dans la liste")

		// Garde-fou : s'il est déjà en base, la liste n'est sans doute pas à jour, on ne touche à rien
		if ((await api.getUrls()).includes(url)) throw new Error("article déjà en base (liste pas à jour ?)")

		// Même chemin que le bouton "Ajouter un article", mais pour un seul article
		const item = await fetchArticleDetails(url)
		await api.saveItem(item)
		await api.deleteItem(pendingAdd.itemId)
		await renderStoredItems()
		showToast("Article publié : le nouveau est dans la base")
		console.log("[Vinted Reupload] remplacé :", pendingAdd.itemId, "->", item.title)
	} catch (e) {
		console.warn("[Vinted Reupload] ajout du nouvel article impossible", e)
		// On garde l'ancien en PUBLISHED pour ne plus être notifié
		await api.setStage(pendingAdd.itemId, "PUBLISHED").catch(() => {})
		showToast("Vinted Reupload : article publié, mais le nouveau n'a pas été ajouté. Utilise « Ajouter un article »")
	}
}
