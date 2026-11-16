import type { Order } from '../types/index.ts'

// Pedidos fictícios para alimentar o dashboard.
export const mockOrders: Order[] = [
  { id: '1042', customer: 'Marina Souza', date: '2026-11-12', items: 3, total: 418.8, status: 'novo' },
  { id: '1041', customer: 'Rafael Lima', date: '2026-11-12', items: 1, total: 489.9, status: 'novo' },
  { id: '1040', customer: 'Joana Reis', date: '2026-11-11', items: 2, total: 253.9, status: 'em separação' },
  { id: '1039', customer: 'Caio Barbosa', date: '2026-11-11', items: 4, total: 612.7, status: 'em separação' },
  { id: '1038', customer: 'Lívia Andrade', date: '2026-11-10', items: 1, total: 98.0, status: 'enviado' },
  { id: '1037', customer: 'Pedro Nascimento', date: '2026-11-09', items: 2, total: 318.9, status: 'enviado' },
  { id: '1036', customer: 'Bianca Farias', date: '2026-11-09', items: 5, total: 734.5, status: 'enviado' },
  { id: '1035', customer: 'Tiago Moreira', date: '2026-11-08', items: 1, total: 189.5, status: 'entregue' },
  { id: '1034', customer: 'Helena Costa', date: '2026-11-07', items: 2, total: 293.9, status: 'entregue' },
  { id: '1033', customer: 'Diego Sampaio', date: '2026-11-07', items: 3, total: 402.9, status: 'entregue' },
  { id: '1032', customer: 'Aline Pires', date: '2026-11-06', items: 1, total: 129.0, status: 'entregue' },
]
