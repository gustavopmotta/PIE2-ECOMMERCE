import { ArrowLeftIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo.tsx'
import MugIllustration from '../../components/MugIllustration.tsx'
import { useAuth } from '../../context/AuthContext.tsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (user) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSending(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente de novo.')
      setSending(false)
    }
  }

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
        <h1>Entrar no painel</h1>
        <p className="login__lead">Acesso só para quem administra a loja.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Usuário
            <input
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Senha
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && (
            <p className="form__error" role="alert">
              <WarningCircleIcon size={18} weight="fill" aria-hidden />
              {error}
            </p>
          )}
          <button type="submit" className="button button--full" disabled={sending}>
            {sending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </main>
    </div>
  )
}
