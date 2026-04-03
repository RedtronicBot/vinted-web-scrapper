export type Product = {
	id: string
	url: string
	status: string
	img: string
	price: string
	likes: number
}

export type Filter = {
	id: number
	search: string
	min_cost: string
	max_cost: string
	brand: Brand
	products: Product[]
}

export type Brand = {
	id: number
	name: string
}

export type Condition = {
	id: number
	name: string
}
