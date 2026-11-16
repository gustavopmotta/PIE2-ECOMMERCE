const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatPrice = (value: number) => brl.format(value)

export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}
