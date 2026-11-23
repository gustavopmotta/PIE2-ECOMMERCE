import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MAX_QUANTITY, useCart } from '../context/CartContext.tsx'
import type { Product } from '../types/index.ts'
import { formatPrice } from '../utils/format.ts'
import ProductTile from './ProductTile.tsx'
import QuantityStepper from './QuantityStepper.tsx'

interface Props {
  product: Product
  onClose: () => void
}

export default function AddToCartDialog({ product, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const navigate = useNavigate()
  const { quantityOf, setQuantity } = useCart()
  const inCart = quantityOf(product.id)
  const available = MAX_QUANTITY - inCart
  const [quantity, setChosen] = useState(1)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setQuantity(product.id, inCart + quantity)
    navigate('/carrinho', { state: { added: product.name } })
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <form className="dialog__body" onSubmit={handleSubmit}>
        <div className="dialog__product">
          <ProductTile image={product.image} small />
          <div>
            <h2 id={titleId}>{product.name}</h2>
            <p>{formatPrice(product.price)} cada</p>
          </div>
        </div>

        <div className="dialog__row">
          <span>Quantidade</span>
          <QuantityStepper
            quantity={quantity}
            min={1}
            max={available}
            label={product.name}
            onChange={(next) => setChosen(Math.max(1, Math.min(next, available)))}
          />
        </div>
        {inCart > 0 && <p className="dialog__note">Você já tem {inCart} no carrinho.</p>}

        <p className="dialog__total">
          <span>Total</span>
          <strong>{formatPrice(product.price * quantity)}</strong>
        </p>

        <div className="dialog__actions">
          <button type="submit" className="button">
            Adicionar ao carrinho
          </button>
          <button type="button" className="button button--ghost" onClick={() => dialogRef.current?.close()}>
            Cancelar
          </button>
        </div>
      </form>
    </dialog>
  )
}
