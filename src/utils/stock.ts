import type { Product } from '../types/index.ts'

const MAX_PER_ITEM = 99

export function stockLimit(product: Product) {
  return Math.min(product.stock ?? MAX_PER_ITEM, MAX_PER_ITEM)
}
