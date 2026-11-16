import { useEffect, useState } from 'react'
import { listOrders } from '../../services/api.ts'
import type { Order } from '../../types/index.ts'
import { formatDate, formatPrice } from '../../utils/format.ts'

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    listOrders().then(setOrders)
  }, [])

  return (
    <>
      <h1>Pedidos</h1>
      {!orders ? (
        <p className="admin__loading">Carregando pedidos…</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th className="num">Itens</th>
                <th className="num">Total</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{formatDate(order.date)}</td>
                  <td className="num">{order.items}</td>
                  <td className="num">{formatPrice(order.total)}</td>
                  <td>
                    <span className={`status status--${order.status.replace(/\s/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '')}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
