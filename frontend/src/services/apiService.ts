import { createApiClient } from "../hooks/createApiClient"
import type { Brand, Condition, Filter, FilterDTO } from "../types"

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
	createBrand: async (dataBrand: Brand): Promise<Brand> => {
		const { data } = await api.post("brand", dataBrand)
		return data
	},
	getBrands: async (): Promise<Brand[]> => {
		const { data } = await api.get("brand")
		return data
	},
	getConditions: async (): Promise<Condition[]> => {
		const { data } = await api.get("condition")
		return data
	},
	createCondition: async (dataCondition: Condition): Promise<Condition> => {
		const { data } = await api.post("condition", dataCondition)
		return data
	},
	getCategories: async (parentId: number | null) => {
		const { data } = await api.get(`category${parentId ? `?parent_id=${parentId}` : ""}`)
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
}
