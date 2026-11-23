import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorBox, { type ErrorInfo } from '../components/ErrorBox.tsx'
import MugIllustration from '../components/MugIllustration.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { getOrder, listMyOrders } from '../services/api.ts'
import { errorDetails } from '../services/http.ts'
import type { Order } from '../types/index.ts'
import { formatDate, formatPrice } from '../utils/format.ts'
import { statusClass, statusLabels } from '../utils/orders.ts'
import { displayPhone } from '../utils/phone.ts'

type Detail = Order | 'carregando' | 'erro'

export default function MyOrders() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [details, setDetails] = useState<Record<number, Detail>>({})

  useEffect(() => {
    listMyOrders()
      .then(setOrders)
      .catch((err) => setError(errorDetails(err)))
  }, [])

  function loadDetail(id: number) {
    if (details[id] && details[id] !== 'erro') return
    setDetails((current) => ({ ...current, [id]: 'carregando' }))
    getOrder(id)
      .then((order) => setDetails((current) => ({ ...current, [id]: order })))
      .catch(() => setDetails((current) => ({ ...current, [id]: 'erro' })))
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <section className="account" aria-labelledby="meus-pedidos">
      <div className="account__head">
        <div>
          <h1 id="meus-pedidos">Meus pedidos</h1>
          {user && (
            <p className="account__who">
              {user.name}
              {user.phone ? `, ${displayPhone(user.phone)}` : ''}
            </p>
          )}
        </div>
        <button type="button" className="button button--ghost" onClick={handleLogout}>
          Sair da conta
        </button>
      </div>

      <ErrorBox error={error} />

      {!error && !orders && <p className="account__loading">Carregando seus pedidos…</p>}

      {orders && orders.length === 0 && (
        <div className="empty">
          <MugIllustration className="empty__art" />
          <h2>Você ainda não fez pedidos</h2>
          <p>Escolha suas canecas no catálogo e finalize pelo carrinho.</p>
          <Link to="/" className="button">
            Ver o catálogo
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <>
          <p className="notice account__notice">
            O pagamento não é feito pelo site: a loja chama você no celular do cadastro para combinar pagamento e
            entrega.
          </p>
          <ul className="orders">
            {orders.map((order) => {
              const detail = details[order.id]
              return (
                <li key={order.id} className="order-card">
                  <div className="order-card__head">
                    <h2>Pedido #{order.id}</h2>
                    <span className={statusClass(order.status)}>{statusLabels[order.status]}</span>
                  </div>
                  <p className="order-card__meta">
                    Feito em {formatDate(order.createdAt)}. Total de {formatPrice(order.total)}.
                  </p>
                  <details onToggle={(event) => event.currentTarget.open && loadDetail(order.id)}>
                    <summary>Ver produtos</summary>
                    {detail === 'carregando' && <p className="order-card__meta">Carregando…</p>}
                    {detail === 'erro' && <p className="field__error">Não foi possível carregar os produtos.</p>}
                    {typeof detail === 'object' && (
                      <ul className="order-card__lines">
                        {detail.lines?.map((line) => (
                          <li key={line.productId}>
                            <span>
                              {line.quantity}× {line.name}
                            </span>
                            <span>{formatPrice(line.subtotal)}</span>
                          </li>
                        ))}
                        {detail.note && <li className="order-card__note">Observação: {detail.note}</li>}
                      </ul>
                    )}
                  </details>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
