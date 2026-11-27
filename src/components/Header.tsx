import { MagnifyingGlassIcon, ShoppingCartIcon, UserCircleIcon } from '@phosphor-icons/react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { useCart } from '../context/CartContext.tsx'
import { useProducts } from '../context/ProductsContext.tsx'
import Logo from './Logo.tsx'

export default function Header() {
  const { count } = useCart()
  const { themes } = useProducts()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const { pathname } = useLocation()
  const current = pathname === '/' && !query ? (params.get('tema') ?? 'todos') : null

  const account = !user
    ? { to: '/entrar', label: 'Entrar' }
    : user.role === 'admin'
      ? { to: '/admin', label: 'Painel' }
      : { to: '/meus-pedidos', label: 'Meus pedidos' }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Iupi, página inicial">
          <Logo />
        </Link>

        <form className="search" role="search" onSubmit={handleSearch}>
          <MagnifyingGlassIcon size={20} aria-hidden />
          <input
            type="search"
            placeholder="Buscar no catálogo"
            aria-label="Buscar no catálogo"
            name="q"
            key={query}
            defaultValue={query}
          />
        </form>

        <Link to={account.to} className="account-link">
          <UserCircleIcon size={24} aria-hidden />
          <span className="account-link__text">{account.label}</span>
        </Link>

        <Link to="/carrinho" className="cart-link" aria-label={`Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}>
          <ShoppingCartIcon size={24} aria-hidden />
          <span className="cart-link__text">Carrinho</span>
          {count > 0 && <span className="cart-link__count">{count}</span>}
        </Link>
      </div>

      {themes.length > 0 && (
        <nav className="nav" aria-label="Temas">
          <div className="container nav__inner">
            <Link to="/" aria-current={current === 'todos' ? 'page' : undefined}>
              Todos os produtos
            </Link>
            {themes.map((theme) => (
              <Link
                key={theme}
                to={`/?tema=${encodeURIComponent(theme)}`}
                aria-current={current === theme ? 'page' : undefined}
              >
                {theme}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
