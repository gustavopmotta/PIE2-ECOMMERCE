// TODO: colocar os links dos perfis
export const socialLinks = [
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/' },
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/5575999067611' },
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com/' },
  { id: 'tiktok', label: 'TikTok', href: 'https://tiktok.com/' },
] as const

export type SocialId = (typeof socialLinks)[number]['id']
