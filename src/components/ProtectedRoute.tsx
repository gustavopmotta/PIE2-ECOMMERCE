import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

// Só deixa passar quem fez login; os demais vão para /admin/login
// e voltam para a página pedida depois de entrar.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return children
}
