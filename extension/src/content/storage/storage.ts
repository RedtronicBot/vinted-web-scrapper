import type { VintedItem } from "../../types"

export async function getItems(): Promise<VintedItem[]> {
  const { vintedItems } = await chrome.storage.local.get("vintedItems")
  return (vintedItems ?? []) as VintedItem[]
}

export async function saveItem(item: VintedItem) {
  const items = await getItems()
  await chrome.storage.local.set({
    vintedItems: [...items, item],
  })
}

export function setPrefill(item: VintedItem) {
  return chrome.storage.local.set({ pendingPrefill: item })
}

export function getPrefill(): Promise<{ pendingPrefill?: VintedItem }> {
  return chrome.storage.local.get("pendingPrefill")
}

export function clearPrefill() {
  return chrome.storage.local.remove("pendingPrefill")
}
