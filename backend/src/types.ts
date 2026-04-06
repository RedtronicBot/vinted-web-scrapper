export type Product = {
  id: number
  url: string
  status: string
  img: string
  price: number
  filter_id: number
  filter?: {
    id: number
    name?: string
  }
  member_id: number
  member?: {
    id: number
    username?: string
  }
  category_id: number
  category?: {
    id: number
    name?: string
  }
  sell_at: Date
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: number
  name: string
  parent_id: number | null
  position: number
}
