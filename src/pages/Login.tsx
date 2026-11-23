import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.tsx'
import ErrorBox, { type ErrorInfo } from '../components/ErrorBox.tsx'
import Field from '../components/Field.tsx'
import { homeFor, useAuth } from '../context/AuthContext.tsx'
import { errorDetails } from '../services/http.ts'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [sending, setSending] = useState(false)

  if (user && !sending) return <Navigate to={homeFor(user, from)} replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      const logged = await login(email, password)
      navigate(homeFor(logged, from), { replace: true })
    } catch (err) {
      setError(errorDetails(err))
      setSending(false)
    }
  }

  return (
    <AuthLayout>
      <h1>Entrar</h1>
      <p className="login__lead">Entre para fazer pedidos e acompanhar cada um. A equipe da loja também entra por aqui.</p>

      <form onSubmit={handleSubmit} className="form">
        <Field
          id="login-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="login-senha"
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <ErrorBox error={error} />
        <button type="submit" className="button button--full" disabled={sending}>
          {sending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="login__switch">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" state={{ from }}>
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
