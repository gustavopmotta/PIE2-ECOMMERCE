import { ChartBarIcon, PackageIcon, ReceiptIcon, SignOutIcon, StorefrontIcon, WarehouseIcon } from '@phosphor-icons/react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import Logo from './Logo.tsx'

const links = [
  { to: '/admin', label: 'Visão geral', icon: ChartBarIcon, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: PackageIcon, end: false },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ReceiptIcon, end: false },
  { to: '/admin/estoque', label: 'Estoque', icon: WarehouseIcon, end: false },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/entrar')
  }

  return (
    <div className="admin">
      <aside className="admin__side">
        <Link to="/admin" className="admin__logo" aria-label="Iupi, painel">
          <Logo />
        </Link>
        <nav className="admin__nav" aria-label="Painel">
          {links.map(({ to, label, icon: NavIcon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <NavIcon size={20} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin__foot">
          <Link to="/">
            <StorefrontIcon size={20} aria-hidden />
            Ver a loja
          </Link>
          <button type="button" onClick={handleLogout}>
            <SignOutIcon size={20} aria-hidden />
            Sair
          </button>
          <p className="admin__user">Conectado como {user?.name}</p>
        </div>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}
