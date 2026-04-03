export interface Product {
	id: string
	url: string
	status: string
	img: string
	price: string
	likes: number
}

export interface Filter {
	id: number
	search: string
	min_cost: string
	max_cost: string
	brand: Brand
	products: Product[]
}

export interface Brand {
	id: number
	name: string
}

export interface Condition {
	id: number
	name: string
}

export interface QueryInterface {
	query: string
	minPrice: number
	maxPrice: number
	brand: number
	condition: number
}

export interface FilterDTO {
	id: number
	search: string
	min_cost: number
	max_cost: number
	brand_id: number
	condition_id: number
}
