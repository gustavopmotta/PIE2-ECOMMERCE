import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { listProducts } from '../services/api.ts'
import type { Product } from '../types/index.ts'
import { readStorage, writeStorage } from '../utils/storage.ts'

interface ProductsContextValue {
  products: Product[]
  loading: boolean
  addProduct: (data: Omit<Product, 'id'>) => void
  updateProduct: (id: string, changes: Partial<Omit<Product, 'id'>>) => void
  removeProduct: (id: string) => void
}

const STORAGE_KEY = 'iupe:products:v3'
const ProductsContext = createContext<ProductsContextValue | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const saved = readStorage<Product[] | null>(STORAGE_KEY, null)
    const source = saved ? Promise.resolve(saved) : listProducts()
    source.then((list) => {
      if (cancelled) return
      setProducts(list)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function save(next: Product[]) {
    setProducts(next)
    writeStorage(STORAGE_KEY, next)
  }

  function addProduct(data: Omit<Product, 'id'>) {
    save([{ ...data, id: crypto.randomUUID() }, ...products])
  }

  function updateProduct(id: string, changes: Partial<Omit<Product, 'id'>>) {
    save(products.map((p) => (p.id === id ? { ...p, ...changes } : p)))
  }

  function removeProduct(id: string) {
    save(products.filter((p) => p.id !== id))
  }

  return (
    <ProductsContext.Provider value={{ products, loading, addProduct, updateProduct, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts precisa estar dentro de <ProductsProvider>')
  return context
}
