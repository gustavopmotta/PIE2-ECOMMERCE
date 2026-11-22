import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import MugIllustration from '../components/MugIllustration.tsx'
import ProductCard from '../components/ProductCard.tsx'
import { useProducts } from '../context/ProductsContext.tsx'
import { categories } from '../data/categories.ts'

type Sort = 'nome' | 'menor-preco' | 'maior-preco'

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function Catalog() {
  const { products, loading } = useProducts()
  const [params] = useSearchParams()
  const [sort, setSort] = useState<Sort>('nome')

  const query = params.get('q') ?? ''
  const category = categories.find((c) => c.id === params.get('categoria'))

  const visible = products
    .filter((p) => p.active)
    .filter((p) => !category || p.category === category.id)
    .filter((p) => normalize(`${p.name} ${p.description}`).includes(normalize(query)))
    .sort((a, b) => {
      if (sort === 'menor-preco') return a.price - b.price
      if (sort === 'maior-preco') return b.price - a.price
      return a.name.localeCompare(b.name, 'pt-BR')
    })

  const title = query ? `Resultados para “${query}”` : (category?.label ?? 'Todos os produtos')
  const showHero = !query && !category

  return (
    <>
      {showHero && (
        <section className="hero">
          <div className="hero__text">
            <h1>Canecas para quem joga</h1>
            <p>Canecas gamer e geek para o café de todo dia.</p>
            <a href="#catalogo" className="button">
              Ver produtos
            </a>
          </div>
          <MugIllustration className="hero__art" />
        </section>
      )}

      <section aria-labelledby="catalogo">
        <div className="catalog__bar">
          <div>
            <h2 id="catalogo">{title}</h2>
            {!loading && (
              <p className="catalog__count">{visible.length === 1 ? '1 produto' : `${visible.length} produtos`}</p>
            )}
          </div>
          <label className="select">
            Ordenar por
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
              <option value="nome">Nome</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="empty">Carregando o catálogo…</p>
        ) : visible.length === 0 ? (
          <div className="empty">
            <p>Nenhum produto encontrado.</p>
            <Link to="/" className="button button--ghost">
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <ul className="grid">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
