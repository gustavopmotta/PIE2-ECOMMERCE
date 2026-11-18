import { ShoppingCartIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.tsx'
import type { Product } from '../types/index.ts'
import { formatPrice } from '../utils/format.ts'
import { stockLimit } from '../utils/stock.ts'
import AddToCartDialog from './AddToCartDialog.tsx'
import ProductTile from './ProductTile.tsx'

export default function ProductCard({ product }: { product: Product }) {
  const { quantityOf } = useCart()
  const [choosing, setChoosing] = useState(false)
  const inCart = quantityOf(product.id)
  const soldOut = product.stock === 0
  const available = stockLimit(product) - inCart

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
        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
          <p className="product__stock">Restam {product.stock} em estoque</p>
        )}
        {inCart > 0 && <p className="product__in-cart">{inCart} no carrinho</p>}
      </div>
      <div className="product__action">
        {soldOut ? (
          <button type="button" className="button button--ghost" disabled>
            Esgotado
          </button>
        ) : available <= 0 ? (
          <Link to="/carrinho" className="button button--ghost">
            Ver no carrinho
          </Link>
        ) : (
          <button type="button" className="button button--ghost" aria-haspopup="dialog" onClick={() => setChoosing(true)}>
            <ShoppingCartIcon size={18} aria-hidden />
            Adicionar ao carrinho
          </button>
        )}
      </div>
      {choosing && <AddToCartDialog product={product} onClose={() => setChoosing(false)} />}
    </li>
  )
}
