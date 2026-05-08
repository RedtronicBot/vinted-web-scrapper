import type { VintedItem } from "../../types"

export async function renderStoredItems() {
  const { vintedItems } = await chrome.storage.local.get("vintedItems")
  const items: VintedItem[] = (vintedItems ?? []) as VintedItem[]

  const list = document.getElementById("vr-list")!

  if (items.length === 0) {
    list.innerHTML = `<p style="font-size:12px;color:#aaa;margin:0;text-align:center;">Aucun article sauvegardé</p>`
    return
  }

  list.innerHTML = items
    .map(
      (item, index) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">
      ${item.photos[0] ? `<img src="${item.photos[0]}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;">` : ""}
      <div style="flex:1;min-width:0;">
        <p style="margin:0;font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</p>
        <p style="margin:0;font-size:11px;color:#888;">${item.price}</p>
      </div>
      <button data-index="${index}" class="vr-republish-btn" style="background:#09b1ba;color:white;border:none;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;">
        Republier
      </button>
    </div>
  `,
    )
    .join("")

  list.querySelectorAll(".vr-republish-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt((btn as HTMLElement).dataset.index!)
      republish(items[index])
    })
  })
}

function republish(item: VintedItem) {
  chrome.storage.local.set({ pendingPrefill: item })
  window.location.href = "https://www.vinted.fr/items/new"
}
