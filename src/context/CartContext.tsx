import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types/index.ts'
import { stockLimit } from '../utils/stock.ts'
import { readStorage, writeStorage } from '../utils/storage.ts'
import { useProducts } from './ProductsContext.tsx'

export interface CartLine {
  product: Product
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  quantityOf: (productId: string) => number
  add: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const STORAGE_KEY = 'iupe:cart:v2'
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts()
  const [items, setItems] = useState<CartItem[]>(() => readStorage<CartItem[]>(STORAGE_KEY, []))

  useEffect(() => {
    writeStorage(STORAGE_KEY, items)
  }, [items])

  const lines: CartLine[] = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId && p.active)
    return product ? [{ product, quantity: Math.min(item.quantity, stockLimit(product)) }] : []
  }).filter((line) => line.quantity > 0)

  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

  function quantityOf(productId: string) {
    return lines.find((line) => line.product.id === productId)?.quantity ?? 0
  }

  function setQuantity(productId: string, quantity: number) {
    const product = products.find((p) => p.id === productId)
    const next = Math.max(0, Math.min(quantity, product ? stockLimit(product) : 0))
    setItems((current) => {
      const others = current.filter((item) => item.productId !== productId)
      if (next === 0) return others
      const exists = current.some((item) => item.productId === productId)
      return exists
        ? current.map((item) => (item.productId === productId ? { ...item, quantity: next } : item))
        : [...others, { productId, quantity: next }]
    })
  }

  const add = (productId: string) => setQuantity(productId, quantityOf(productId) + 1)
  const remove = (productId: string) => setQuantity(productId, 0)
  const clear = () => setItems([])

  return (
    <CartContext.Provider value={{ lines, count, subtotal, quantityOf, add, setQuantity, remove, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return context
}
