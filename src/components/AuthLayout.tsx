import { ArrowLeftIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo.tsx'
import MugIllustration from './MugIllustration.tsx'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="login">
      <div className="login__pattern" aria-hidden>
        <Logo />
        <MugIllustration />
      </div>
      <main className="login__panel">
        <Link to="/" className="login__back">
          <ArrowLeftIcon size={18} aria-hidden />
          Voltar para a loja
        </Link>
        {children}
      </main>
    </div>
  )
}
