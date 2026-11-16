import { ShoppingCartIcon } from '@phosphor-icons/react'
import { useCart } from '../context/CartContext.tsx'
import type { Product } from '../types/index.ts'
import { formatPrice } from '../utils/format.ts'
import ProductTile from './ProductTile.tsx'
import QuantityStepper from './QuantityStepper.tsx'

export default function ProductCard({ product }: { product: Product }) {
  const { add, setQuantity, quantityOf } = useCart()
  const quantity = quantityOf(product.id)
  const soldOut = product.stock === 0

  return (
    <li className={`product${soldOut ? ' product--sold-out' : ''}`}>
      <ProductTile image={product.image} />
      <div className="product__body">
        <h3 className="product__name">{product.name}</h3>
        {product.description && <p className="product__description">{product.description}</p>}
        <p className="product__price">
          {product.priceFrom && 'a partir de '}
          {formatPrice(product.price)}
        </p>
        {product.stock > 0 && product.stock <= 5 && (
          <p className="product__stock">Restam {product.stock} em estoque</p>
        )}
      </div>
      <div className="product__action">
        {soldOut ? (
          <button type="button" className="button button--ghost" disabled>
            Esgotado
          </button>
        ) : quantity > 0 ? (
          <QuantityStepper
            quantity={quantity}
            max={product.stock}
            label={product.name}
            onChange={(next) => setQuantity(product.id, next)}
          />
        ) : (
          <button type="button" className="button button--ghost" onClick={() => add(product.id)}>
            <ShoppingCartIcon size={18} aria-hidden />
            Adicionar ao carrinho
          </button>
        )}
      </div>
    </li>
  )
}
