import type { VintedItem, VintedItemPayload } from "../../types"

const API_URL = import.meta.env.VITE_API_URL

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	})
	if (!res.ok) throw new Error(`API error ${res.status}`)
	return res.json()
}

export const api = {
	getItems: () => request<VintedItem[]>("/items"),
	saveItem: (item: VintedItemPayload) =>
		request<VintedItem>("/items", {
			method: "POST",
			body: JSON.stringify(item),
		}),
	deleteItem: (id: number) =>
		request<void>(`/items/${id}`, {
			method: "DELETE",
		}),
}
