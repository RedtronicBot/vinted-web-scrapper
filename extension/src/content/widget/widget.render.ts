import type { VintedItem } from "../../types"
import { api } from "../api/api"
import { setPrefill } from "../prefill/prefill"
const UPLOADS_URL = import.meta.env.VITE_API_URL

export async function renderStoredItems() {
	const list = document.getElementById("vr-list")!
	list.innerHTML = `<p style="font-size:12px;color:#aaa;margin:0;text-align:center;">Chargement...</p>`

	let items: VintedItem[]
	try {
		items = await api.getItems()
	} catch {
		list.innerHTML = `<p style="font-size:12px;color:red;margin:0;text-align:center;">Erreur de connexion au serveur</p>`
		return
	}

	if (items.length === 0) {
		list.innerHTML = `<p style="font-size:12px;color:#aaa;margin:0;text-align:center;">Aucun article sauvegardé</p>`
		return
	}

	list.innerHTML = items.map(renderItem).join("")

	list.querySelectorAll(".vr-republish-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const id = +(btn as HTMLElement).dataset.id!
			const item = items.find((i) => i.id === id)!
			republish(item)
		})
	})
}

function renderItem(item: VintedItem) {
	const firstPhoto = item.photos[0] ? `${UPLOADS_URL}/uploads/${item.photos[0].filename}` : null
	return `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">
      ${firstPhoto ? `<img src="${firstPhoto}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;">` : ""}
      <div style="flex:1;min-width:0;">
        <p style="margin:0;font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</p>
        <p style="margin:0;font-size:11px;color:#888;">${item.price}</p>
      </div>
      <button data-id="${item.id}" class="vr-republish-btn" style="background:#09b1ba;color:white;border:none;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;">
        Republier
      </button>
    </div>
  `
}

async function republish(item: VintedItem) {
	await setPrefill(item)
	window.location.href = "https://www.vinted.fr/items/new"
}
