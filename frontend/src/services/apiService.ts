import { createApiClient } from "../hooks/createApiClient"
import type { Brand, Color, Filter, FilterDTO, State } from "../types"

const api = createApiClient()
export const apiService = {
	createFilter: async (dataFilter: Omit<FilterDTO, "id">): Promise<Filter> => {
		const { data } = await api.post("filter", dataFilter)
		return data
	},
	getFilters: async (): Promise<Filter[]> => {
		const { data } = await api.get("filter/like")
		return data
	},
	deleteFilter: async (id: number): Promise<void> => {
		await api.delete(`filter/${id}`)
	},
	createBrand: async (dataBrand: Brand): Promise<Brand> => {
		const { data } = await api.post("brand", dataBrand)
		return data
	},
	getBrands: async (): Promise<Brand[]> => {
		const { data } = await api.get("brand")
		return data
	},
	getStates: async (): Promise<State[]> => {
		const { data } = await api.get("state")
		return data
	},
	createState: async (dataState: State): Promise<State> => {
		const { data } = await api.post("state", dataState)
		return data
	},
	getCategories: async (parentId: number | null) => {
		const { data } = await api.get(`category${parentId ? `?parent_id=${parentId}` : ""}`)
		return data
	},
	getFullTree: async () => {
		const { data } = await api.get("category/tree")
		return data
	},

	createCategory: async (dataCategory: { name: string; parent_id: number | null; position: number }) => {
		const { data } = await api.post("category", dataCategory)
		return data
	},

	createVintedCategory: async (dataVintedCategory: { id: number; category_id: number }) => {
		const { data } = await api.post("category/vinted", dataVintedCategory)
		return data
	},
	getCheckStatus: async () => {
		const { data } = await api.get("products/check/status")
		return data
	},
	triggerCheck: async () => {
		const { data } = await api.post("products/check")
		return data
	},
	getColors: async (): Promise<Color[]> => {
		const { data } = await api.get("color")
		return data
	},
	createColor: async (dataColor: Color): Promise<Color[]> => {
		const { data } = await api.post("color", dataColor)
		return data
	},
}
