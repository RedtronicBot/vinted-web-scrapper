import { createApiClient } from "../hooks/createApiClient"
import type { BrandInterface, FilterDTO } from "../page/Filter"
import type { Brand, Condition, Filter } from "../types"

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
	createBrand: async (dataBrand: BrandInterface): Promise<Brand> => {
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
}
