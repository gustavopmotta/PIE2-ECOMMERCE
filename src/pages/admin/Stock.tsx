import { CheckCircleIcon } from '@phosphor-icons/react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import ErrorBox, { type ErrorInfo } from '../../components/ErrorBox.tsx'
import { useProducts } from '../../context/ProductsContext.tsx'
import { createMovement, listAdminProducts, listMovements } from '../../services/api.ts'
import { errorDetails } from '../../services/http.ts'
import type { AdminProduct, MovementType, StockMovement } from '../../types/index.ts'
import { formatDateTime } from '../../utils/format.ts'

const typeLabels: Record<MovementType, string> = {
  entrada: 'Entrada',
  ajuste: 'Ajuste',
  baixa: 'Baixa (pedido pago)',
  devolucao: 'Devolução (pedido cancelado)',
}

function validate(productId: string, type: 'entrada' | 'ajuste', quantity: string, reason: string) {
  const amount = Number(quantity)
  if (!productId) return 'Escolha o produto.'
  if (!Number.isInteger(amount) || amount === 0) return 'Informe uma quantidade inteira diferente de zero.'
  if (type === 'entrada' && amount < 0) return 'Entrada só aceita quantidade positiva. Para tirar do estoque, use Ajuste.'
  if (reason.trim().length < 3) return 'Escreva o motivo, com pelo menos 3 caracteres.'
  return null
}

export default function Stock() {
  const { reload: reloadCatalog } = useProducts()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [movements, setMovements] = useState<StockMovement[] | null>(null)
  const [error, setError] = useState<ErrorInfo | null>(null)

  const [productId, setProductId] = useState('')
  const [type, setType] = useState<'entrada' | 'ajuste'>('entrada')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<ErrorInfo | null>(null)
  const [success, setSuccess] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(() => {
    Promise.all([listAdminProducts(), listMovements()])
      .then(([productList, movementList]) => {
        setProducts([...productList].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
        setMovements(movementList)
        setError(null)
      })
      .catch((err) => setError(errorDetails(err)))
  }, [])

  useEffect(load, [load])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSuccess('')
    const problem = validate(productId, type, quantity, reason)
    if (problem) {
      setFormError({ message: problem, details: [] })
      return
    }
    setFormError(null)
    setSending(true)
    try {
      const result = await createMovement({
        productId: Number(productId),
        type,
        quantity: Number(quantity),
        reason,
      })
      setSuccess(`Estoque de ${result.productName} atualizado: ${result.stock} un.`)
      setQuantity('')
      setReason('')
      load()
      reloadCatalog()
    } catch (err) {
      setFormError(errorDetails(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <h1>Estoque</h1>
      <ErrorBox error={error} />

      <form className="panel form form--grid" onSubmit={handleSubmit} aria-labelledby="nova-movimentacao" noValidate>
        <h2 id="nova-movimentacao" className="form__wide">
          Registrar entrada ou ajuste
        </h2>
        <label className="form__wide">
          Produto
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Escolha o produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.stock} un.)
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value as 'entrada' | 'ajuste')}>
            <option value="entrada">Entrada (chegou mercadoria)</option>
            <option value="ajuste">Ajuste (correção, perda, quebra)</option>
          </select>
        </label>
        <label>
          Quantidade
          <input
            type="number"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={type === 'entrada' ? '10' : '-2'}
          />
        </label>
        <label>
          Motivo
          <input maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reposição do fornecedor" />
        </label>
        <p className="form__wide field__hint">
          A quantidade é o quanto muda, e não o novo total: 10 soma dez unidades e -2 tira duas.
        </p>
        <div className="form__wide">
          <ErrorBox error={formError} />
          {success && (
            <p className="form__success" role="status">
              <CheckCircleIcon size={20} weight="fill" aria-hidden />
              {success}
            </p>
          )}
        </div>
        <button type="submit" className="button form__submit" disabled={sending}>
          {sending ? 'Registrando…' : 'Registrar'}
        </button>
      </form>

      <h2 className="admin__subtitle">Histórico</h2>
      {!error && !movements && <p className="admin__loading">Carregando histórico…</p>}
      {movements && movements.length === 0 && (
        <p className="panel panel__empty">Nenhuma movimentação ainda. As entradas, ajustes e pedidos pagos aparecem aqui.</p>
      )}
      {movements && movements.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th className="num">Quantidade</th>
                <th>Motivo</th>
                <th>Registrado por</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{formatDateTime(m.createdAt)}</td>
                  <td>{m.productName}</td>
                  <td>
                    {typeLabels[m.type]}
                    {m.orderId && <span className="table__sub">Pedido #{m.orderId}</span>}
                  </td>
                  <td className={`num ${m.quantity > 0 ? 'is-positive' : 'is-negative'}`}>
                    {m.quantity > 0 ? `+${m.quantity}` : `−${Math.abs(m.quantity)}`}
                  </td>
                  <td className="table__wrap">{m.reason ?? '—'}</td>
                  <td>{m.userName ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
