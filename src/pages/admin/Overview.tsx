import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext.tsx'
import { listOrders } from '../../services/api.ts'
import type { Order } from '../../types/index.ts'
import { formatDate, formatPrice } from '../../utils/format.ts'

export default function Overview() {
  const { products } = useProducts()
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    listOrders().then(setOrders)
  }, [])

  if (!orders) return <p className="admin__loading">Carregando o painel…</p>

  const revenue = orders.reduce((sum, order) => sum + order.total, 0)
  const lowStock = products.filter((p) => p.active && p.stock <= 5)

  // Vendas agrupadas por dia, do mais antigo para o mais recente.
  const byDay = new Map<string, number>()
  for (const order of [...orders].sort((a, b) => a.date.localeCompare(b.date))) {
    byDay.set(order.date, (byDay.get(order.date) ?? 0) + order.total)
  }
  const days = [...byDay.entries()]
  const peak = Math.max(...days.map(([, total]) => total), 1)

  const stats = [
    { label: 'Vendas na semana', value: formatPrice(revenue) },
    { label: 'Pedidos', value: String(orders.length) },
    { label: 'Valor médio por pedido', value: formatPrice(orders.length ? revenue / orders.length : 0) },
    { label: 'Produtos no catálogo', value: String(products.filter((p) => p.active).length) },
  ]

  return (
    <>
      <h1>Visão geral</h1>

      <dl className="stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat">
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="admin__columns">
        <section className="panel" aria-labelledby="vendas-dia">
          <h2 id="vendas-dia">Vendas por dia</h2>
          <ol className="bars">
            {days.map(([date, total]) => (
              <li key={date}>
                <span className="bars__value">{formatPrice(total)}</span>
                <span className="bars__bar" style={{ height: `${(total / peak) * 100}%` }} />
                <span className="bars__label">{formatDate(date).slice(0, 5)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel" aria-labelledby="estoque-baixo">
          <h2 id="estoque-baixo">Estoque baixo</h2>
          {lowStock.length === 0 ? (
            <p className="panel__empty">Nenhum produto com 5 unidades ou menos.</p>
          ) : (
            <ul className="low-stock">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <strong className={p.stock === 0 ? 'is-zero' : ''}>{p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}</strong>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/produtos" className="panel__link">
            Gerenciar produtos
          </Link>
        </section>
      </div>
    </>
  )
}
