import { socialLinks } from '../data/social.ts'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>© {year} Iupe. Loja em construção, com dados fictícios.</p>
        <ul>
          {socialLinks.map((link) => (
            <li key={link.id}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
