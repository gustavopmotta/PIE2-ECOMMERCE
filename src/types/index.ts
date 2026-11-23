export type Role = 'cliente' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: Role
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  category: string | null
  theme: string | null
  material: string | null
  available: boolean
  image: string | null
}

export interface AdminProduct extends Omit<Product, 'available'> {
  stock: number
  minStock: number
  hidden: boolean
}

export interface ProductInput {
  name: string
  description: string
  price: string
  category: string
  theme: string
  material: string
  minStock: string
  initialStock: string
  image: string
}

export interface CartItem {
  productId: number
  quantity: number
}

export type OrderStatus = 'pendente' | 'pago' | 'em_preparo' | 'enviado' | 'entregue' | 'cancelado'

export interface OrderLine {
  productId: number
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Customer {
  name: string | null
  email: string | null
  phone: string | null
}

export interface Order {
  id: number
  status: OrderStatus
  total: number
  note: string | null
  createdAt: string
  customer: Customer | null
  lines: OrderLine[] | null
}

export type MovementType = 'entrada' | 'ajuste' | 'baixa' | 'devolucao'

export interface StockMovement {
  id: number
  productId: number
  productName: string
  type: MovementType
  quantity: number
  reason: string | null
  orderId: number | null
  userName: string | null
  createdAt: string
}
