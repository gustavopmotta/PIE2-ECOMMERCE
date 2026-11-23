export function phoneDigits(value: string) {
  const trimmed = value.trim()
  const national = trimmed.startsWith('+55') ? trimmed.slice(3) : trimmed
  return national.replace(/\D/g, '').slice(0, 11)
}

// máscara enquanto a pessoa digita: (71) 99999-8888
export function formatPhone(value: string) {
  const d = phoneDigits(value)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// telefone vindo da API (só números, de 10 a 13 dígitos)
export function displayPhone(digits: string) {
  const d = digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return digits
}

export function isMobilePhone(digits: string) {
  return /^[1-9]{2}9\d{8}$/.test(digits)
}

export function whatsappLink(digits: string, message: string) {
  const number = digits.length > 11 && digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
