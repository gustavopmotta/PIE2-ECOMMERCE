export type Category = 'gamer' | 'geek-nerd'

export interface Product {
  id: string
  name: string
  description: string
  category: Category
  price: number
  priceFrom?: boolean
  stock?: number
  active: boolean
  image?: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export type OrderStatus = 'novo' | 'em separação' | 'enviado' | 'entregue' | 'cancelado'

export interface OrderLine {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  customer: string
  phone: string
  date: string
  items: number
  total: number
  status: OrderStatus
  lines: OrderLine[]
}

export interface AdminUser {
  name: string
  login: string
}
