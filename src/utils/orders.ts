import type { Order, OrderStatus } from '../types/index.ts'
import { whatsappLink } from './phone.ts'

export const statusLabels: Record<OrderStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  em_preparo: 'Em preparo',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

// mesmas regras da API (src/utils/statusPedido.js no back-end)
export const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pendente: ['pago', 'cancelado'],
  pago: ['em_preparo', 'cancelado'],
  em_preparo: ['enviado', 'cancelado'],
  enviado: ['entregue', 'cancelado'],
  entregue: [],
  cancelado: [],
}

export const confirmedStatuses: OrderStatus[] = ['pago', 'em_preparo', 'enviado', 'entregue']

export const statusClass = (status: OrderStatus) => `status status--${status.replace('_', '-')}`

export function contactLink(order: Order) {
  const phone = order.customer?.phone
  if (!phone) return null
  const firstName = (order.customer?.name ?? '').split(' ')[0]
  return whatsappLink(phone, `Olá, ${firstName}! Aqui é da Iupe, sobre o seu pedido #${order.id}.`)
}
