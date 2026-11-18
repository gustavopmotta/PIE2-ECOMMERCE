import { WhatsappLogoIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext.tsx'
import { listOrders } from '../../services/api.ts'
import type { Order } from '../../types/index.ts'
import { formatDate, formatPrice, toISODate } from '../../utils/format.ts'
import { contactLink } from '../../utils/orders.ts'
import { formatPhone } from '../../utils/phone.ts'

function lastSevenDays() {
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) =>
    toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i)),
  )
}

export default function Overview() {
  const { products } = useProducts()
  const [data, setData] = useState<{ orders: Order[]; days: string[] } | null>(null)

  useEffect(() => {
    listOrders().then((orders) => setData({ orders, days: lastSevenDays() }))
  }, [])

  if (!data) return <p className="admin__loading">Carregando o painel…</p>

  const { orders, days } = data
  const recent = orders.filter((order) => order.status !== 'cancelado' && order.date >= days[0])
  const newOrders = orders.filter((order) => order.status === 'novo')
  const byDay = days.map((day) => ({
    day,
    total: recent.filter((order) => order.date === day).reduce((sum, order) => sum + order.total, 0),
  }))
  const peak = Math.max(...byDay.map(({ total }) => total), 1)
  const lowStock = products.filter((p) => p.active && p.stock !== undefined && p.stock <= 5)

  const stats = [
    { label: 'Pedidos novos', value: String(newOrders.length) },
    { label: 'Pedidos nos últimos 7 dias', value: String(recent.length) },
    { label: 'Vendas nos últimos 7 dias', value: formatPrice(recent.reduce((sum, order) => sum + order.total, 0)) },
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
          {orders.length === 0 ? (
            <p className="panel__empty">Ainda não há vendas. O total de cada dia aparece aqui.</p>
          ) : (
            <ol className="bars">
              {byDay.map(({ day, total }) => (
                <li key={day}>
                  <span className="bars__value">{total > 0 ? formatPrice(total) : ''}</span>
                  <span className="bars__bar" style={{ height: `${(total / peak) * 100}%` }} />
                  <span className="bars__label">{formatDate(day).slice(0, 5)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel" aria-labelledby="pedidos-novos">
          <h2 id="pedidos-novos">Pedidos novos</h2>
          {newOrders.length === 0 ? (
            <p className="panel__empty">
              {orders.length === 0
                ? 'Nenhum pedido ainda. Quando um cliente registrar um pedido na loja, ele aparece aqui.'
                : 'Nenhum pedido esperando contato.'}
            </p>
          ) : (
            <ul className="panel__list">
              {newOrders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <div className="panel__list-main">
                    <strong>{order.customer}</strong>
                    <span>
                      Pedido #{order.id}, {formatPrice(order.total)}
                    </span>
                  </div>
                  <a
                    className="contact"
                    href={contactLink(order)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Chamar ${order.customer} no WhatsApp, ${formatPhone(order.phone)}`}
                  >
                    <WhatsappLogoIcon size={18} weight="fill" aria-hidden />
                    {formatPhone(order.phone)}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/pedidos" className="panel__link">
            Ver todos os pedidos
          </Link>
        </section>
      </div>

      {lowStock.length > 0 && (
        <section className="panel admin__section" aria-labelledby="estoque-baixo">
          <h2 id="estoque-baixo">Estoque baixo</h2>
          <ul className="panel__list">
            {lowStock.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <strong className={p.stock === 0 ? 'is-zero' : ''}>{p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}</strong>
              </li>
            ))}
          </ul>
          <Link to="/admin/produtos" className="panel__link">
            Gerenciar produtos
          </Link>
        </section>
      )}
    </>
  )
}
