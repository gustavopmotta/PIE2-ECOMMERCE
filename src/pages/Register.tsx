import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.tsx'
import ErrorBox, { type ErrorInfo } from '../components/ErrorBox.tsx'
import Field from '../components/Field.tsx'
import { homeFor, useAuth } from '../context/AuthContext.tsx'
import { errorDetails } from '../services/http.ts'
import { formatPhone, isMobilePhone, phoneDigits } from '../utils/phone.ts'

type FieldName = 'name' | 'email' | 'phone' | 'password'

function validate(form: Record<FieldName, string>) {
  const errors: Partial<Record<FieldName, string>> = {}
  const digits = phoneDigits(form.phone)
  if (form.name.trim().length < 2) errors.name = 'Informe seu nome.'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Informe um e-mail válido, como nome@email.com.'
  if (!digits) errors.phone = 'Informe seu celular com DDD.'
  else if (!isMobilePhone(digits)) errors.phone = 'Confira o número: são 11 dígitos contando o DDD, e o celular começa com 9.'
  if (form.password.length < 6) errors.password = 'A senha precisa ter pelo menos 6 caracteres.'
  else if (form.password.length > 72) errors.password = 'Use no máximo 72 caracteres.'
  return errors
}

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [form, setForm] = useState<Record<FieldName, string>>({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [serverError, setServerError] = useState<ErrorInfo | null>(null)
  const [sending, setSending] = useState(false)

  if (user && !sending) return <Navigate to={homeFor(user, from)} replace />

  function update(field: FieldName, value: string) {
    setForm({ ...form, [field]: field === 'phone' ? formatPhone(value) : value })
    if (errors[field]) setErrors({ ...errors, [field]: undefined })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setServerError(null)
    const found = validate(form)
    setErrors(found)
    const firstInvalid = (['name', 'email', 'phone', 'password'] as FieldName[]).find((field) => found[field])
    if (firstInvalid) {
      document.getElementById(`cadastro-${firstInvalid}`)?.focus()
      return
    }

    setSending(true)
    try {
      const created = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: phoneDigits(form.phone),
        password: form.password,
      })
      navigate(homeFor(created, from), { replace: true })
    } catch (err) {
      setServerError(errorDetails(err))
      setSending(false)
    }
  }

  return (
    <AuthLayout>
      <h1>Criar conta</h1>
      <p className="login__lead">A loja usa seu nome e celular para combinar pagamento e entrega dos pedidos.</p>

      <form onSubmit={handleSubmit} className="form" noValidate>
        <Field
          id="cadastro-name"
          label="Nome"
          autoComplete="name"
          value={form.name}
          error={errors.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <Field
          id="cadastro-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => update('email', e.target.value)}
        />
        <Field
          id="cadastro-phone"
          label="Celular com DDD"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(00) 00000-0000"
          value={form.phone}
          error={errors.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <Field
          id="cadastro-password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          value={form.password}
          error={errors.password}
          hint="Pelo menos 6 caracteres."
          onChange={(e) => update('password', e.target.value)}
        />
        <ErrorBox error={serverError} />
        <button type="submit" className="button button--full" disabled={sending}>
          {sending ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>

      <p className="login__switch">
        Já tem conta?{' '}
        <Link to="/entrar" state={{ from }}>
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
