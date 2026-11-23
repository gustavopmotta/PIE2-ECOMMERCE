import { ShoppingCartIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MAX_QUANTITY, useCart } from '../context/CartContext.tsx'
import type { Product } from '../types/index.ts'
import { formatPrice } from '../utils/format.ts'
import AddToCartDialog from './AddToCartDialog.tsx'
import ProductTile from './ProductTile.tsx'

export default function ProductCard({ product }: { product: Product }) {
  const { quantityOf } = useCart()
  const [choosing, setChoosing] = useState(false)
  const inCart = quantityOf(product.id)
  const soldOut = !product.available

  return (
    <li className={`product${soldOut ? ' product--sold-out' : ''}`}>
      <ProductTile image={product.image} />
      <div className="product__body">
        <h3 className="product__name">{product.name}</h3>
        {product.description && <p className="product__description">{product.description}</p>}
        <p className="product__price">{formatPrice(product.price)}</p>
        {inCart > 0 && <p className="product__in-cart">{inCart} no carrinho</p>}
      </div>
      <div className="product__action">
        {soldOut ? (
          <button type="button" className="button button--ghost" disabled>
            Esgotado
          </button>
        ) : inCart >= MAX_QUANTITY ? (
          <Link to="/carrinho" className="button button--ghost">
            Ver no carrinho
          </Link>
        ) : (
          <button type="button" className="button button--ghost" aria-haspopup="dialog" onClick={() => setChoosing(true)}>
            <ShoppingCartIcon size={18} aria-hidden />
            {'Adicionar'}
            <span className="product__more"> ao carrinho</span>
          </button>
        )}
      </div>
      {choosing && <AddToCartDialog product={product} onClose={() => setChoosing(false)} />}
    </li>
  )
}
