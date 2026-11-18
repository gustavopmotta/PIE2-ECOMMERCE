import { createContext, useContext, useState, type ReactNode } from 'react'
import { loginAdmin } from '../services/api.ts'
import type { AdminUser } from '../types/index.ts'
import { readStorage, removeStorage, writeStorage } from '../utils/storage.ts'

interface AuthContextValue {
  user: AdminUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

interface Session {
  user: AdminUser
  expiresAt: number
}

// a sessão acaba ao fechar o navegador ou depois de 8 horas
const STORAGE_KEY = 'iupe:admin-session'
const SESSION_MS = 8 * 60 * 60 * 1000

function loadSession() {
  const session = readStorage<Session | null>(STORAGE_KEY, null, 'session')
  if (!session || session.expiresAt < Date.now()) return null
  return session.user
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(loadSession)

  async function login(username: string, password: string) {
    const admin = await loginAdmin(username, password)
    setUser(admin)
    writeStorage(STORAGE_KEY, { user: admin, expiresAt: Date.now() + SESSION_MS }, 'session')
  }

  function logout() {
    setUser(null)
    removeStorage(STORAGE_KEY, 'session')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}
