import { WhatsappLogoIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorBox, { type ErrorInfo } from '../../components/ErrorBox.tsx'
import { listAdminOrders, listAdminProducts } from '../../services/api.ts'
import { errorDetails } from '../../services/http.ts'
import type { AdminProduct, Order } from '../../types/index.ts'
import { formatDate, formatPrice, toISODate } from '../../utils/format.ts'
import { confirmedStatuses, contactLink } from '../../utils/orders.ts'
import { displayPhone } from '../../utils/phone.ts'

interface Data {
  orders: Order[]
  products: AdminProduct[]
  days: string[]
}

function lastSevenDays() {
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) =>
    toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i)),
  )
}

export default function Overview() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<ErrorInfo | null>(null)

  useEffect(() => {
    Promise.all([listAdminOrders(), listAdminProducts()])
      .then(([orders, products]) => setData({ orders, products, days: lastSevenDays() }))
      .catch((err) => setError(errorDetails(err)))
  }, [])

  if (error) {
    return (
      <>
        <h1>Visão geral</h1>
        <ErrorBox error={error} />
      </>
    )
  }
  if (!data) return <p className="admin__loading">Carregando o painel…</p>

  const { orders, products, days } = data
  const recent = orders.filter((order) => order.status !== 'cancelado' && toISODate(order.createdAt) >= days[0])
  const confirmed = recent.filter((order) => confirmedStatuses.includes(order.status))
  const pending = orders.filter((order) => order.status === 'pendente')
  const byDay = days.map((day) => ({
    day,
    total: confirmed.filter((order) => toISODate(order.createdAt) === day).reduce((sum, order) => sum + order.total, 0),
  }))
  const peak = Math.max(...byDay.map(({ total }) => total), 1)
  const lowStock = products.filter((p) => !p.hidden && p.stock <= p.minStock)

  const stats = [
    { label: 'Pedidos pendentes', value: String(pending.length) },
    { label: 'Pedidos nos últimos 7 dias', value: String(recent.length) },
    { label: 'Vendas confirmadas em 7 dias', value: formatPrice(confirmed.reduce((sum, order) => sum + order.total, 0)) },
    { label: 'Produtos à venda', value: String(products.filter((p) => !p.hidden).length) },
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
          <h2 id="vendas-dia">Vendas confirmadas por dia</h2>
          {confirmed.length === 0 ? (
            <p className="panel__empty">
              Nenhuma venda confirmada nos últimos 7 dias. Um pedido entra aqui quando é marcado como pago.
            </p>
          ) : (
            <ol className="bars">
              {byDay.map(({ day, total }) => (
                <li key={day}>
                  <span className="bars__value">{total > 0 ? formatPrice(total) : ''}</span>
                  <span className="bars__bar" style={{ height: `${(total / peak) * 100}%` }} />
                  <span className="bars__label">{day.slice(8, 10)}/{day.slice(5, 7)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel" aria-labelledby="pedidos-pendentes">
          <h2 id="pedidos-pendentes">Pedidos pendentes</h2>
          {pending.length === 0 ? (
            <p className="panel__empty">
              {orders.length === 0
                ? 'Nenhum pedido ainda. Quando um cliente fizer um pedido na loja, ele aparece aqui.'
                : 'Nenhum pedido esperando contato.'}
            </p>
          ) : (
            <ul className="panel__list">
              {pending.slice(0, 5).map((order) => {
                const link = contactLink(order)
                return (
                  <li key={order.id}>
                    <div className="panel__list-main">
                      <strong>{order.customer?.name ?? 'Cliente sem cadastro'}</strong>
                      <span>
                        Pedido #{order.id}, {formatDate(order.createdAt)}, {formatPrice(order.total)}
                      </span>
                    </div>
                    {link && order.customer?.phone && (
                      <a
                        className="contact"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Chamar ${order.customer.name ?? 'cliente'} no WhatsApp, ${displayPhone(order.customer.phone)}`}
                      >
                        <WhatsappLogoIcon size={18} weight="fill" aria-hidden />
                        {displayPhone(order.customer.phone)}
                      </a>
                    )}
                  </li>
                )
              })}
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
            {lowStock.slice(0, 8).map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <strong className={p.stock === 0 ? 'is-zero' : ''}>{p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}</strong>
              </li>
            ))}
          </ul>
          {lowStock.length > 8 && <p className="panel__empty">E mais {lowStock.length - 8} produtos.</p>}
          <Link to="/admin/estoque" className="panel__link">
            Registrar entrada de estoque
          </Link>
        </section>
      )}
    </>
  )
}
