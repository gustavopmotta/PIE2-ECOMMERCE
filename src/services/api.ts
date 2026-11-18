import { adminAccount } from '../data/admin.ts'
import { initialProducts } from '../data/products.ts'
import type { AdminUser, Order, OrderLine, OrderStatus, Product } from '../types/index.ts'
import { toISODate } from '../utils/format.ts'
import { readStorage, writeStorage } from '../utils/storage.ts'

// TODO: trocar o localStorage por chamadas à API

const ORDERS_KEY = 'iupe:orders'
const LAST_ORDER_KEY = 'iupe:last-order-id'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const readOrders = () => readStorage<Order[]>(ORDERS_KEY, [])

export async function listProducts(): Promise<Product[]> {
  await delay()
  return initialProducts
}

export async function listOrders(): Promise<Order[]> {
  await delay()
  return readOrders()
}

export interface NewOrder {
  customer: string
  phone: string
  lines: OrderLine[]
}

export async function createOrder({ customer, phone, lines }: NewOrder): Promise<Order> {
  await delay(400)
  const saved = readOrders()
  const lastId = Math.max(readStorage(LAST_ORDER_KEY, 0), ...saved.map((order) => Number(order.id) || 0))
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

  const order: Order = {
    id: String(lastId + 1),
    customer,
    phone,
    date: toISODate(new Date()),
    items: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: Math.round(total * 100) / 100,
    status: 'novo',
    lines,
  }
  writeStorage(ORDERS_KEY, [order, ...saved])
  writeStorage(LAST_ORDER_KEY, lastId + 1)
  return order
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  writeStorage(ORDERS_KEY, readOrders().map((order) => (order.id === id ? { ...order, status } : order)))
}

export async function deleteOrder(id: string) {
  writeStorage(ORDERS_KEY, readOrders().filter((order) => order.id !== id))
}

// login provisório, validar no backend depois
export async function loginAdmin(username: string, password: string): Promise<AdminUser> {
  await delay(400)
  const sameUser = username.trim().toLowerCase() === adminAccount.login.toLowerCase()
  if (sameUser && password === adminAccount.password) {
    return { name: 'Administrador', login: adminAccount.login }
  }
  throw new Error('Usuário ou senha incorretos.')
}
