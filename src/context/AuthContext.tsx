import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../services/api.ts'
import { setAuthToken, setUnauthorizedHandler } from '../services/http.ts'
import type { User } from '../types/index.ts'
import { readStorage, removeStorage, writeStorage } from '../utils/storage.ts'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (account: api.NewAccount) => Promise<User>
  logout: () => void
}

interface Session {
  token: string
  user: User
  expiresAt: number
}

// a sessão acaba ao fechar o navegador ou quando o token da API vence (8 horas)
const STORAGE_KEY = 'iupe:sessao'

function tokenExpiry(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp * 1000
  } catch {
    return Date.now() + 8 * 60 * 60 * 1000
  }
}

function loadSession() {
  const session = readStorage<Session | null>(STORAGE_KEY, null, 'session')
  return session && session.expiresAt > Date.now() ? session : null
}

const initialSession = loadSession()
setAuthToken(initialSession?.token ?? null)

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(initialSession)

  const logout = useCallback(() => {
    setAuthToken(null)
    setSession(null)
    removeStorage(STORAGE_KEY, 'session')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  useEffect(() => {
    if (!initialSession) return
    api
      .fetchMe()
      .then((user) => setSession((current) => (current ? { ...current, user } : current)))
      .catch(() => {})
  }, [])

  async function login(email: string, password: string) {
    const { token, user } = await api.login(email.trim(), password)
    const next = { token, user, expiresAt: tokenExpiry(token) }
    setAuthToken(token)
    setSession(next)
    writeStorage(STORAGE_KEY, next, 'session')
    return user
  }

  async function register(account: api.NewAccount) {
    await api.register(account)
    return login(account.email, account.password)
  }

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}

export function homeFor(user: User, from?: string) {
  if (user.role === 'admin') return from?.startsWith('/admin') ? from : '/admin'
  return from && !from.startsWith('/admin') ? from : '/'
}
