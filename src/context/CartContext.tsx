import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types/index.ts'
import { readStorage, writeStorage } from '../utils/storage.ts'
import { useProducts } from './ProductsContext.tsx'

export const MAX_QUANTITY = 99

export interface CartLine {
  product: Product
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  hasUnavailable: boolean
  quantityOf: (productId: number) => number
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  clear: () => void
}

const STORAGE_KEY = 'iupi:carrinho'
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts()
  const [items, setItems] = useState<CartItem[]>(() => readStorage<CartItem[]>(STORAGE_KEY, []))

  useEffect(() => {
    writeStorage(STORAGE_KEY, items)
  }, [items])

  // junta o carrinho com o catálogo da API; produto oculto ou excluído sai da conta
  const lines: CartLine[] = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId)
    return product ? [{ product, quantity: Math.min(item.quantity, MAX_QUANTITY) }] : []
  })

  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  const hasUnavailable = lines.some((line) => !line.product.available)

  function quantityOf(productId: number) {
    return lines.find((line) => line.product.id === productId)?.quantity ?? 0
  }

  function setQuantity(productId: number, quantity: number) {
    const next = Math.max(0, Math.min(quantity, MAX_QUANTITY))
    setItems((current) => {
      if (next === 0) return current.filter((item) => item.productId !== productId)
      return current.some((item) => item.productId === productId)
        ? current.map((item) => (item.productId === productId ? { ...item, quantity: next } : item))
        : [...current, { productId, quantity: next }]
    })
  }

  const remove = (productId: number) => setQuantity(productId, 0)
  const clear = () => setItems([])

  return (
    <CartContext.Provider
      value={{ lines, count, subtotal, hasUnavailable, quantityOf, setQuantity, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return context
}
