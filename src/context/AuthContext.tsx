import { createContext, useContext, useState, type ReactNode } from 'react'
import { loginAdmin } from '../services/api.ts'
import type { AdminUser } from '../types/index.ts'
import { readStorage, removeStorage, writeStorage } from '../utils/storage.ts'

interface AuthContextValue {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'iupe:admin'
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => readStorage<AdminUser | null>(STORAGE_KEY, null))

  async function login(email: string, password: string) {
    const admin = await loginAdmin(email, password)
    setUser(admin)
    writeStorage(STORAGE_KEY, admin)
  }

  function logout() {
    setUser(null)
    removeStorage(STORAGE_KEY)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}
