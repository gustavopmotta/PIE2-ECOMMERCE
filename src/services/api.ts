import { mockOrders } from '../data/orders.ts'
import { mockProducts } from '../data/products.ts'
import type { AdminUser, Order, Product } from '../types/index.ts'

// Camada única de acesso a dados. Hoje devolve dados fictícios com um
// pequeno atraso; quando a API estiver pronta, troque o corpo de cada
// função por um fetch e o resto do app continua igual.

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listProducts(): Promise<Product[]> {
  await delay()
  return mockProducts
}

export async function listOrders(): Promise<Order[]> {
  await delay()
  return mockOrders
}

// Login de demonstração. NÃO é segurança de verdade: a validação
// real precisa acontecer no backend.
export const DEMO_ADMIN = { email: 'admin@iupe.com', password: 'iupe123' }

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  await delay(400)
  if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
    return { name: 'Administrador', email: DEMO_ADMIN.email }
  }
  throw new Error('E-mail ou senha incorretos.')
}
