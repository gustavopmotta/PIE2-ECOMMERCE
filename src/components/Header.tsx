import { MagnifyingGlassIcon, ShoppingCartIcon } from '@phosphor-icons/react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { categories } from '../data/categories.ts'
import { useCart } from '../context/CartContext.tsx'
import Logo from './Logo.tsx'

export default function Header() {
  const { count } = useCart()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const { pathname } = useLocation()
  const current = pathname === '/' && !query ? (params.get('categoria') ?? 'todos') : null

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Iupe, página inicial">
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

        <Link to="/carrinho" className="cart-link" aria-label={`Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}>
          <ShoppingCartIcon size={24} aria-hidden />
          <span className="cart-link__text">Carrinho</span>
          {count > 0 && <span className="cart-link__count">{count}</span>}
        </Link>
      </div>

      <nav className="nav" aria-label="Categorias">
        <div className="container nav__inner">
          <Link to="/" aria-current={current === 'todos' ? 'page' : undefined}>
            Todos os produtos
          </Link>
          {categories.map((c) => (
            <Link key={c.id} to={`/?categoria=${c.id}`} aria-current={current === c.id ? 'page' : undefined}>
              {c.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
