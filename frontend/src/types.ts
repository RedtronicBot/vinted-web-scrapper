export interface Product {
	id: number
	url: string
	status: "ACTIVE" | "SOLD" | "DELETE"
	img: string | null
	price: string
	likes: number
	category: VintedCategory | null
	sell_at: string
	createdAt: string
	size: string
	state: string
}

export interface Filter {
	id: number
	search: string
	min_cost: number
	max_cost: number
	brand: Brand | null
	category: {
		category: {
			name: string
		}
	} | null
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
	category: number
}

export interface FilterDTO {
	id: number
	search: string
	min_cost: number
	max_cost: number
	brand_id: number
	condition_id: number
	category_id: number
}

export interface CategoryVinted {
	name: string
	parent_id: number | null
	position: number
}

export interface StackItem {
	id: number
	name: string
}

export interface Category {
	id: number
	name: string
	children: Category[]
	vinted: { id: number }
}

export interface RootNode {
	children: Category[]
}

export interface CategoryFormValues {
	name: string
}

export interface VintedFormValues {
	vinted_id: number
}

export interface VintedCategory {
	category: Category
}
