import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ErrorInfo } from '../components/ErrorBox.tsx'
import { listProducts } from '../services/api.ts'
import { errorDetails } from '../services/http.ts'
import type { Product } from '../types/index.ts'

interface ProductsContextValue {
  products: Product[]
  themes: string[]
  loading: boolean
  error: ErrorInfo | null
  reload: () => void
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    listProducts()
      .then((list) => {
        if (cancelled) return
        setProducts(list)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(errorDetails(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  const themes = [...new Set(products.map((p) => p.theme).filter((t): t is string => Boolean(t)))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )

  return (
    <ProductsContext.Provider value={{ products, themes, loading, error, reload }}>{children}</ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts precisa estar dentro de <ProductsProvider>')
  return context
}
