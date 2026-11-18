import type { Order, OrderStatus } from '../types/index.ts'
import { whatsappLink } from './phone.ts'

export const orderStatuses: { id: OrderStatus; label: string }[] = [
  { id: 'novo', label: 'Novo' },
  { id: 'em separação', label: 'Em separação' },
  { id: 'enviado', label: 'Enviado' },
  { id: 'entregue', label: 'Entregue' },
  { id: 'cancelado', label: 'Cancelado' },
]

export function statusClass(status: OrderStatus) {
  const slug = status.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')
  return `status status--${slug}`
}

export function contactLink(order: Order) {
  const firstName = order.customer.split(' ')[0]
  return whatsappLink(order.phone, `Olá, ${firstName}! Aqui é da Iupe, sobre o seu pedido #${order.id}.`)
}
