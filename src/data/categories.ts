import type { Category } from '../types/index.ts'

export const categories: { id: Category; label: string }[] = [
  { id: 'gamer', label: 'Gamer' },
  { id: 'geek-nerd', label: 'Geek Nerd' },
]

export function categoryLabel(id: Category) {
  return categories.find((c) => c.id === id)?.label ?? id
}
