export interface Product {
  id: number
  url: string
  status: "ACTIVE" | "SOLD" | "DELETE" | "ARCHIVED"
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
  category: VintedCategory | null
  products: Product[]
  color_ids: number[]
}

export interface NamedEntity {
  id: number
  name: string
}

export type Brand = NamedEntity

export type State = NamedEntity

export interface FilterDTO {
  id: number
  search: string
  min_cost: number
  max_cost: number
  brand_id: number
  state_id: number[]
  category_id: number
  color_id: number[]
  size_id: number[]
}

export interface CategoryVinted {
  name: string
  parent_id: number | null
  position: number
}

export type StackItem = NamedEntity

export interface Category {
  id: number
  name: string
  children: Category[]
  vinted: { id: number } | null
}

export interface VintedFormValues {
  vinted_id: number
}

export interface VintedCategory {
  category: Category
}

export type Color = NamedEntity

export interface Size {
  id: number
  name: string
  category_id: number
}

export type SizeFormValues = {
  id: number
  name: string
}

export interface VintedCategoryWithSizes {
  id: number
  name: string
  children: Category[]
  sizes: Size[]
}
