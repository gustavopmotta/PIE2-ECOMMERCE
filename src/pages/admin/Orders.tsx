import { CaretDownIcon, CaretUpIcon, EnvelopeSimpleIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { Fragment, useEffect, useState } from 'react'
import ErrorBox, { type ErrorInfo } from '../../components/ErrorBox.tsx'
import { getAdminOrder, listAdminOrders, updateOrderStatus } from '../../services/api.ts'
import { errorDetails } from '../../services/http.ts'
import type { Order, OrderStatus } from '../../types/index.ts'
import { formatDate, formatPrice } from '../../utils/format.ts'
import { contactLink, nextStatuses, statusClass, statusLabels } from '../../utils/orders.ts'
import { displayPhone } from '../../utils/phone.ts'

type Filter = OrderStatus | 'todos'
type Detail = Order | 'carregando' | 'erro'

const filters: Filter[] = ['todos', 'pendente', 'pago', 'em_preparo', 'enviado', 'entregue', 'cancelado']

const confirmations: Partial<Record<OrderStatus, string>> = {
  pago: 'Confirmar o pagamento do pedido #{id}? O estoque dos produtos dá baixa agora.',
  cancelado: 'Cancelar o pedido #{id}? Se o estoque já tinha saído, ele volta. Não dá para desfazer.',
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [filter, setFilter] = useState<Filter>('todos')
  const [open, setOpen] = useState<Set<number>>(new Set())
  const [details, setDetails] = useState<Record<number, Detail>>({})
  const [rowErrors, setRowErrors] = useState<Record<number, ErrorInfo | undefined>>({})
  const [busy, setBusy] = useState<number | null>(null)

  useEffect(() => {
    listAdminOrders()
      .then(setOrders)
      .catch((err) => setError(errorDetails(err)))
  }, [])

  function loadDetail(id: number) {
    setDetails((current) => ({ ...current, [id]: 'carregando' }))
    getAdminOrder(id)
      .then((order) => setDetails((current) => ({ ...current, [id]: order })))
      .catch(() => setDetails((current) => ({ ...current, [id]: 'erro' })))
  }

  function toggle(id: number) {
    const next = new Set(open)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
      if (!details[id] || details[id] === 'erro') loadDetail(id)
    }
    setOpen(next)
  }

  async function handleStatus(order: Order, status: OrderStatus) {
    const question = confirmations[status]?.replace('{id}', String(order.id))
    if (question && !window.confirm(question)) return

    setBusy(order.id)
    setRowErrors((current) => ({ ...current, [order.id]: undefined }))
    try {
      const updated = await updateOrderStatus(order.id, status)
      setOrders((current) => current && current.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)))
      setDetails((current) => (current[order.id] ? { ...current, [order.id]: updated } : current))
    } catch (err) {
      setRowErrors((current) => ({ ...current, [order.id]: errorDetails(err) }))
      setOpen((current) => new Set(current).add(order.id))
      if (!details[order.id]) loadDetail(order.id)
    } finally {
      setBusy(null)
    }
  }

  const visible = orders?.filter((order) => filter === 'todos' || order.status === filter) ?? []

  return (
    <>
      <h1>Pedidos</h1>
      <ErrorBox error={error} />

      {!error && !orders && <p className="admin__loading">Carregando pedidos…</p>}

      {orders && orders.length === 0 && (
        <p className="panel panel__empty">
          Nenhum pedido ainda. Quando um cliente fizer um pedido na loja, ele aparece aqui com os dados de contato.
        </p>
      )}

      {orders && orders.length > 0 && (
        <>
          <div className="filters" role="group" aria-label="Filtrar por situação">
            {filters.map((option) => {
              const total = option === 'todos' ? orders.length : orders.filter((o) => o.status === option).length
              return (
                <button
                  key={option}
                  type="button"
                  className="filter"
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                >
                  {option === 'todos' ? 'Todos' : statusLabels[option]} ({total})
                </button>
              )
            })}
          </div>

          {visible.length === 0 ? (
            <p className="panel panel__empty">Nenhum pedido nesta situação.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>Data</th>
                    <th className="num">Total</th>
                    <th>Situação</th>
                    <th>
                      <span className="sr-only">Produtos</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((order) => {
                    const link = contactLink(order)
                    const detail = details[order.id]
                    const rowError = rowErrors[order.id]
                    const choices = nextStatuses[order.status]
                    const isOpen = open.has(order.id)
                    return (
                      <Fragment key={order.id}>
                        <tr>
                          <td>#{order.id}</td>
                          <td>{order.customer?.name ?? 'Cliente sem cadastro'}</td>
                          <td>
                            {link && order.customer?.phone ? (
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
                            ) : order.customer?.email ? (
                              <a className="contact" href={`mailto:${order.customer.email}`}>
                                <EnvelopeSimpleIcon size={18} aria-hidden />
                                {order.customer.email}
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td className="num">{formatPrice(order.total)}</td>
                          <td>
                            {choices.length === 0 ? (
                              <span className={statusClass(order.status)}>{statusLabels[order.status]}</span>
                            ) : (
                              <select
                                className={statusClass(order.status)}
                                value={order.status}
                                disabled={busy === order.id}
                                aria-label={`Situação do pedido #${order.id}`}
                                onChange={(event) => handleStatus(order, event.target.value as OrderStatus)}
                              >
                                {[order.status, ...choices].map((status) => (
                                  <option key={status} value={status}>
                                    {status === order.status ? statusLabels[status] : `Mudar para ${statusLabels[status].toLowerCase()}`}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="num">
                            <button
                              type="button"
                              className="link-button"
                              aria-expanded={isOpen}
                              onClick={() => toggle(order.id)}
                            >
                              {isOpen ? 'Fechar' : 'Ver produtos'}
                              {isOpen ? <CaretUpIcon size={14} aria-hidden /> : <CaretDownIcon size={14} aria-hidden />}
                            </button>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="table__items">
                            <td />
                            <td colSpan={6}>
                              <ErrorBox error={rowError ?? null} />
                              {detail === 'carregando' && 'Carregando…'}
                              {detail === 'erro' && 'Não foi possível carregar os produtos deste pedido.'}
                              {typeof detail === 'object' && (
                                <>
                                  {detail.lines?.map((line) => `${line.quantity}× ${line.name}`).join(', ')}
                                  {detail.note && <span className="table__note">Observação: {detail.note}</span>}
                                </>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
