import { CheckCircleIcon, InfoIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductTile from '../components/ProductTile.tsx'
import QuantityStepper from '../components/QuantityStepper.tsx'
import { useCart } from '../context/CartContext.tsx'
import { formatPrice } from '../utils/format.ts'

export default function Cart() {
  const { lines, count, subtotal, setQuantity, remove, clear } = useCart()
  const [registered, setRegistered] = useState(false)

  // Não há pagamento: o pedido é apenas registrado (simulação).
  // Quando a API existir, envie `lines` para ela aqui.
  function handleRegister() {
    clear()
    setRegistered(true)
  }

  if (registered) {
    return (
      <div className="empty">
        <CheckCircleIcon size={48} weight="duotone" className="empty__icon" aria-hidden />
        <h1>Pedido registrado</h1>
        <p>Nenhum pagamento foi cobrado. A loja entra em contato para combinar pagamento e entrega.</p>
        <Link to="/" className="button">
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="empty">
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
                max={product.stock}
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

      <aside className="summary" aria-labelledby="resumo">
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
        <p className="notice">
          <InfoIcon size={20} aria-hidden />
          Esta loja não processa pagamento online. Ao registrar, nada é cobrado.
        </p>
        <button type="button" className="button button--full" onClick={handleRegister}>
          Registrar pedido
        </button>
        <Link to="/" className="summary__back">
          Continuar comprando
        </Link>
      </aside>
    </div>
  )
}
