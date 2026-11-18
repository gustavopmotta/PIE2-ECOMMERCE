export function phoneDigits(value: string) {
  const trimmed = value.trim()
  const national = trimmed.startsWith('+55') ? trimmed.slice(3) : trimmed
  return national.replace(/\D/g, '').slice(0, 11)
}

export function formatPhone(value: string) {
  const d = phoneDigits(value)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function isMobilePhone(digits: string) {
  return /^[1-9]{2}9\d{8}$/.test(digits)
}

export function whatsappLink(digits: string, message: string) {
  return `https://wa.me/55${digits}?text=${encodeURIComponent(message)}`
}
