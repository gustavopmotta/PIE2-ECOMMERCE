import { PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { useProducts } from '../../context/ProductsContext.tsx'
import { categories, categoryLabel } from '../../data/categories.ts'
import type { Category } from '../../types/index.ts'
import { formatPrice } from '../../utils/format.ts'

const emptyForm = { name: '', description: '', category: 'gamer' as Category, price: '', stock: '', image: '' }

export default function Products() {
  const { products, loading, addProduct, updateProduct, removeProduct } = useProducts()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    addProduct({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Math.floor(Number(form.stock)),
      active: true,
      image: form.image.trim() || undefined,
    })
    setForm(emptyForm)
    setOpen(false)
  }

  function handleRemove(id: string, name: string) {
    if (window.confirm(`Excluir "${name}" do catálogo?`)) removeProduct(id)
  }

  return (
    <>
      <div className="admin__head">
        <h1>Produtos</h1>
        <button type="button" className="button" onClick={() => setOpen(!open)}>
          {open ? <XIcon size={18} aria-hidden /> : <PlusIcon size={18} weight="bold" aria-hidden />}
          {open ? 'Cancelar' : 'Adicionar produto'}
        </button>
      </div>

      {open && (
        <form className="panel form form--grid" onSubmit={handleSubmit}>
          <label className="form__wide">
            Nome
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="form__wide">
            Descrição curta
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="form__wide">
            Foto (URL ou caminho, opcional)
            <input placeholder="/produtos/nome-do-arquivo.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </label>
          <label>
            Categoria
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preço (R$)
            <input type="number" min="0.01" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label>
            Estoque
            <input type="number" min="0" step="1" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </label>
          <button type="submit" className="button form__submit">
            Salvar produto
          </button>
        </form>
      )}

      {loading ? (
        <p className="admin__loading">Carregando produtos…</p>
      ) : products.length === 0 ? (
        <p className="panel panel__empty">Nenhum produto cadastrado. Adicione o primeiro para ele aparecer no catálogo.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th className="num">Preço</th>
                <th className="num">Estoque</th>
                <th>No catálogo</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{categoryLabel(p.category)}</td>
                  <td className="num">{formatPrice(p.price)}</td>
                  <td className="num">
                    <input
                      className="table__stock"
                      type="number"
                      min="0"
                      aria-label={`Estoque de ${p.name}`}
                      value={p.stock}
                      onChange={(e) => updateProduct(p.id, { stock: Math.max(0, Math.floor(Number(e.target.value))) })}
                    />
                  </td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={p.active} onChange={(e) => updateProduct(p.id, { active: e.target.checked })} />
                      <span>{p.active ? 'Visível' : 'Oculto'}</span>
                    </label>
                  </td>
                  <td className="num">
                    <button type="button" className="icon-button" onClick={() => handleRemove(p.id, p.name)} aria-label={`Excluir ${p.name}`}>
                      <TrashIcon size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
