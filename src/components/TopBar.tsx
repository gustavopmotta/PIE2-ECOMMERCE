import { FacebookLogoIcon, InstagramLogoIcon, TiktokLogoIcon, UserGearIcon, WhatsappLogoIcon, type Icon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { socialLinks, type SocialId } from '../data/social.ts'

const icons: Record<SocialId, Icon> = {
  instagram: InstagramLogoIcon,
  whatsapp: WhatsappLogoIcon,
  facebook: FacebookLogoIcon,
  tiktok: TiktokLogoIcon,
}

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <nav className="topbar__social" aria-label="Redes sociais">
          {socialLinks.map((link) => {
            const SocialIcon = icons[link.id]
            return (
              <a key={link.id} href={link.href} target="_blank" rel="noreferrer">
                <SocialIcon size={18} weight="fill" aria-hidden />
                <span>{link.label}</span>
              </a>
            )
          })}
        </nav>
        <Link to="/admin" className="topbar__admin">
          <UserGearIcon size={18} aria-hidden />
          Área do administrador
        </Link>
      </div>
    </div>
  )
}
