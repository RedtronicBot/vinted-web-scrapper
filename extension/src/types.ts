export interface Photo {
	id: number
	filename: string
	createdAt: string
	itemId: number
}

export interface VintedItem {
	id?: number
	title: string
	price: string
	brand: string
	size: string
	status: string
	description: string
	color: string
	createdAt?: string
	photos: Photo[]
}

export type VintedItemPayload = Omit<VintedItem, "id" | "createdAt" | "photos"> & { photos: string[] }
