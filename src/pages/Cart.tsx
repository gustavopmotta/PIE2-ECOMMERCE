import { CheckIcon, InfoIcon, TrashIcon } from '@phosphor-icons/react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MugIllustration from '../components/MugIllustration.tsx'
import ProductTile from '../components/ProductTile.tsx'
import QuantityStepper from '../components/QuantityStepper.tsx'
import { useCart } from '../context/CartContext.tsx'
import { createOrder } from '../services/api.ts'
import type { Order } from '../types/index.ts'
import { formatPrice } from '../utils/format.ts'
import { formatPhone, isMobilePhone, phoneDigits } from '../utils/phone.ts'
import { stockLimit } from '../utils/stock.ts'

interface Errors {
  name?: string
  phone?: string
  form?: string
}

export default function Cart() {
  const { lines, count, subtotal, setQuantity, remove, clear } = useCart()
  const location = useLocation()
  const added = (location.state as { added?: string } | null)?.added

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const digits = phoneDigits(phone)
    const found: Errors = {}
    if (name.trim().length < 2) found.name = 'Informe seu nome.'
    if (!digits) found.phone = 'Informe seu celular com DDD.'
    else if (!isMobilePhone(digits)) found.phone = 'Confira o número: são 11 dígitos contando o DDD, e o celular começa com 9.'
    setErrors(found)

    if (found.name) {
      nameRef.current?.focus()
      return
    }
    if (found.phone) {
      phoneRef.current?.focus()
      return
    }

    setSending(true)
    try {
      const created = await createOrder({
        customer: name.trim(),
        phone: digits,
        lines: lines.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
      })
      clear()
      setOrder(created)
    } catch {
      setErrors({ form: 'Não foi possível registrar o pedido. Tente de novo.' })
      setSending(false)
    }
  }

  if (order) {
    const firstName = order.customer.split(' ')[0]
    return (
      <div className="empty">
        <span className="empty__badge" aria-hidden>
          <CheckIcon size={44} weight="bold" />
        </span>
        <h1>Pedido #{order.id} registrado</h1>
        <p>
          Obrigado, {firstName}! A loja vai entrar em contato pelo <span className="nowrap">{formatPhone(order.phone)}</span> para combinar
          pagamento e entrega. Nenhum valor foi cobrado.
        </p>
        <Link to="/" className="button">
          Voltar ao catálogo
        </Link>
      </div>
    )
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
              </div>
              <QuantityStepper
                quantity={quantity}
                max={stockLimit(product)}
                label={product.name}
                onChange={(next) => setQuantity(product.id, next)}
              />
              <p className="cart__total">{formatPrice(product.price * quantity)}</p>
              <button type="button" className="icon-button" onClick={() => remove(product.id)} aria-label={`Remover ${product.name}`}>
                <TrashIcon size={20} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form className="summary form" aria-labelledby="resumo" noValidate onSubmit={handleSubmit}>
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

        <div className="summary__fields" role="group" aria-labelledby="seus-dados">
          <h3 id="seus-dados">Seus dados</h3>
          <div className="field">
            <label htmlFor="cliente-nome">Nome</label>
            <input
              id="cliente-nome"
              ref={nameRef}
              autoComplete="name"
              value={name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'cliente-nome-erro' : undefined}
              onChange={(event) => {
                setName(event.target.value)
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
            />
            {errors.name && (
              <p id="cliente-nome-erro" className="field__error">
                {errors.name}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="cliente-celular">Celular com DDD</label>
            <input
              id="cliente-celular"
              ref={phoneRef}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="(00) 00000-0000"
              value={phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? 'cliente-celular-erro' : undefined}
              onChange={(event) => {
                setPhone(formatPhone(event.target.value))
                if (errors.phone) setErrors({ ...errors, phone: undefined })
              }}
            />
            {errors.phone && (
              <p id="cliente-celular-erro" className="field__error">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <p className="notice">
          <InfoIcon size={20} aria-hidden />
          O pagamento não é feito pelo site. Depois do pedido, a loja chama você nesse celular para combinar pagamento e
          entrega.
        </p>
        {errors.form && (
          <p className="form__error" role="alert">
            {errors.form}
          </p>
        )}
        <button type="submit" className="button button--full" disabled={sending}>
          {sending ? 'Registrando…' : 'Registrar pedido'}
        </button>
        <Link to="/" className="summary__back">
          Continuar comprando
        </Link>
      </form>
    </div>
  )
}
