import { CheckIcon, InfoIcon, TrashIcon } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ErrorBox, { type ErrorInfo } from '../components/ErrorBox.tsx'
import MugIllustration from '../components/MugIllustration.tsx'
import ProductTile from '../components/ProductTile.tsx'
import QuantityStepper from '../components/QuantityStepper.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { MAX_QUANTITY, useCart } from '../context/CartContext.tsx'
import { useProducts } from '../context/ProductsContext.tsx'
import { createOrder } from '../services/api.ts'
import { ApiError, errorDetails } from '../services/http.ts'
import type { Order } from '../types/index.ts'
import { formatPrice } from '../utils/format.ts'
import { displayPhone } from '../utils/phone.ts'

export default function Cart() {
  const { lines, count, subtotal, hasUnavailable, setQuantity, remove, clear } = useCart()
  const { loading: catalogLoading, error: catalogError, reload } = useProducts()
  const { user } = useAuth()
  const location = useLocation()
  const added = (location.state as { added?: string } | null)?.added

  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      const created = await createOrder(
        lines.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        note,
      )
      clear()
      setOrder(created)
    } catch (err) {
      const info = errorDetails(err)
      if (err instanceof ApiError && err.status === 401) {
        info.message = 'Sua sessão expirou. Entre de novo para fazer o pedido.'
      }
      setError(info)
      setSending(false)
    }
  }

  if (order) {
    const firstName = (order.customer?.name ?? user?.name ?? '').split(' ')[0]
    const phone = order.customer?.phone ?? user?.phone
    return (
      <div className="empty">
        <span className="empty__badge" aria-hidden>
          <CheckIcon size={44} weight="bold" />
        </span>
        <h1>Pedido #{order.id} registrado</h1>
        <p>
          Obrigado, {firstName}! O total ficou em {formatPrice(order.total)}. A loja vai entrar em contato
          {phone ? (
            <>
              {' '}
              pelo <span className="nowrap">{displayPhone(phone)}</span>
            </>
          ) : null}{' '}
          para combinar pagamento e entrega. Nenhum valor foi cobrado.
        </p>
        <div className="empty__actions">
          <Link to="/meus-pedidos" className="button">
            Ver meus pedidos
          </Link>
          <Link to="/" className="button button--ghost">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    )
  }

  if (catalogError) {
    return (
      <div className="empty">
        <h1>Carrinho</h1>
        <ErrorBox error={{ ...catalogError, message: `Não foi possível carregar os produtos. ${catalogError.message}` }} />
        <button type="button" className="button button--ghost" onClick={reload}>
          Tentar de novo
        </button>
      </div>
    )
  }

  if (catalogLoading) {
    return <p className="empty">Carregando o carrinho…</p>
  }

  if (lines.length === 0) {
    return (
      <div className="empty">
        <MugIllustration className="empty__art" />
        <h1>Seu carrinho está vazio</h1>
        <p>Escolha produtos no catálogo e eles aparecem aqui.</p>
        <Link to="/" className="button">
          Ver o catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="cart">
      <section aria-labelledby="carrinho">
        <h1 id="carrinho">Carrinho</h1>
        {added && (
          <p className="cart__added" role="status">
            <CheckIcon size={18} weight="bold" aria-hidden />
            Adicionado ao carrinho: {added}
          </p>
        )}
        <ul className="cart__list">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="cart__line">
              <ProductTile image={product.image} small />
              <div className="cart__info">
                <h2>{product.name}</h2>
                <p>{formatPrice(product.price)} cada</p>
                {!product.available && <p className="cart__sold-out">Esgotado</p>}
              </div>
              <QuantityStepper
                quantity={quantity}
                max={MAX_QUANTITY}
                label={product.name}
                onChange={(next) => setQuantity(product.id, next)}
              />
              <p className="cart__total">{formatPrice(product.price * quantity)}</p>
              <button
                type="button"
                className="icon-button"
                onClick={() => remove(product.id)}
                aria-label={`Remover ${product.name}`}
              >
                <TrashIcon size={20} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form className="summary form" aria-labelledby="resumo" onSubmit={handleSubmit}>
        <h2 id="resumo">Resumo</h2>
        <dl>
          <div>
            <dt>{count === 1 ? '1 item' : `${count} itens`}</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="summary__total">
            <dt>Total</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
        </dl>

        {!user && (
          <div className="summary__fields">
            <h3>Entre para fazer o pedido</h3>
            <p className="summary__text">A loja usa o nome e o celular da sua conta para combinar pagamento e entrega.</p>
            <Link to="/entrar" state={{ from: '/carrinho' }} className="button button--full">
              Entrar
            </Link>
            <Link to="/cadastro" state={{ from: '/carrinho' }} className="button button--ghost button--full">
              Criar conta
            </Link>
          </div>
        )}

        {user?.role === 'admin' && (
          <p className="notice">
            <InfoIcon size={20} aria-hidden />
            Você entrou como administrador. Para testar um pedido, entre com uma conta de cliente.
          </p>
        )}

        {user?.role === 'cliente' && (
          <>
            <div className="summary__fields">
              <h3>Pedido em nome de</h3>
              <p className="summary__customer">
                <strong>{user.name}</strong>
                {user.phone && <span>{displayPhone(user.phone)}</span>}
                <span>{user.email}</span>
              </p>
              <div className="field">
                <label htmlFor="pedido-observacao">Observação (opcional)</label>
                <textarea
                  id="pedido-observacao"
                  rows={3}
                  maxLength={500}
                  placeholder="Ex.: prefiro retirar na loja"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>

            <p className="notice">
              <InfoIcon size={20} aria-hidden />
              O pagamento não é feito pelo site. Depois do pedido, a loja chama você no celular da sua conta para
              combinar pagamento e entrega.
            </p>
            {hasUnavailable && <p className="form__error">Tire do carrinho os produtos esgotados para continuar.</p>}
            <ErrorBox error={error} />
            <button type="submit" className="button button--full" disabled={sending || hasUnavailable}>
              {sending ? 'Enviando pedido…' : 'Fazer pedido'}
            </button>
          </>
        )}

        <Link to="/" className="summary__back">
          Continuar comprando
        </Link>
      </form>
    </div>
  )
}
