export type Category = 'gamer' | 'geek-nerd'

export interface Product {
  id: string
  name: string
  description: string
  category: Category
  price: number
  priceFrom?: boolean // mostra "a partir de" antes do preço
  stock: number
  active: boolean
  image?: string // caminho ou URL da foto
}

export interface CartItem {
  productId: string
  quantity: number
}

export type OrderStatus = 'novo' | 'em separação' | 'enviado' | 'entregue'

export interface Order {
  id: string
  customer: string
  date: string // AAAA-MM-DD
  items: number
  total: number
  status: OrderStatus
}

export interface AdminUser {
  name: string
  email: string
}
