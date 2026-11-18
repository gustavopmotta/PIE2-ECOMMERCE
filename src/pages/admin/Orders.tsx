import { TrashIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { Fragment, useEffect, useState } from 'react'
import { deleteOrder, listOrders, updateOrderStatus } from '../../services/api.ts'
import type { Order, OrderStatus } from '../../types/index.ts'
import { formatDate, formatPrice } from '../../utils/format.ts'
import { contactLink, orderStatuses, statusClass } from '../../utils/orders.ts'
import { formatPhone } from '../../utils/phone.ts'

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    listOrders().then(setOrders)
  }, [])

  function handleStatus(id: string, status: OrderStatus) {
    setOrders((current) => current && current.map((order) => (order.id === id ? { ...order, status } : order)))
    void updateOrderStatus(id, status)
  }

  function handleDelete(order: Order) {
    if (!window.confirm(`Excluir o pedido #${order.id} de ${order.customer}? Não dá para desfazer.`)) return
    setOrders((current) => current && current.filter((item) => item.id !== order.id))
    void deleteOrder(order.id)
  }

  return (
    <>
      <h1>Pedidos</h1>
      {!orders ? (
        <p className="admin__loading">Carregando pedidos…</p>
      ) : orders.length === 0 ? (
        <p className="panel panel__empty">
          Nenhum pedido ainda. Quando um cliente registrar um pedido na loja, ele aparece aqui com nome, celular e
          produtos.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Data</th>
                <th className="num">Itens</th>
                <th className="num">Total</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <Fragment key={order.id}>
                  <tr>
                    <td>#{order.id}</td>
                    <td>{order.customer}</td>
                    <td>
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
                    </td>
                    <td>{formatDate(order.date)}</td>
                    <td className="num">{order.items}</td>
                    <td className="num">{formatPrice(order.total)}</td>
                    <td>
                      <select
                        className={statusClass(order.status)}
                        value={order.status}
                        aria-label={`Situação do pedido #${order.id}`}
                        onChange={(event) => handleStatus(order.id, event.target.value as OrderStatus)}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="num">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleDelete(order)}
                        aria-label={`Excluir o pedido #${order.id}`}
                      >
                        <TrashIcon size={20} />
                      </button>
                    </td>
                  </tr>
                  <tr className="table__items">
                    <td />
                    <td colSpan={7}>{order.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
