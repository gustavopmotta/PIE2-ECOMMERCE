const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export const formatPrice = (value: number) => brl.format(value)

// datas da API chegam em ISO ("2026-11-21T15:00:00.000Z") e são mostradas no fuso de quem acessa
export const formatDate = (iso: string) => date.format(new Date(iso))

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))

export function toISODate(value: Date | string) {
  const d = typeof value === 'string' ? new Date(value) : value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
