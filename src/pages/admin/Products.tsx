import { PencilSimpleIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import ErrorBox, { type ErrorInfo } from '../../components/ErrorBox.tsx'
import ProductTile from '../../components/ProductTile.tsx'
import { useProducts } from '../../context/ProductsContext.tsx'
import {
  createProduct,
  deleteProduct,
  listAdminProducts,
  setProductHidden,
  updateProduct,
} from '../../services/api.ts'
import { ApiError, errorDetails } from '../../services/http.ts'
import type { AdminProduct, ProductInput } from '../../types/index.ts'
import { formatPrice } from '../../utils/format.ts'

const emptyForm: ProductInput = {
  name: '',
  description: '',
  price: '',
  category: '',
  theme: '',
  material: '',
  minStock: '',
  initialStock: '',
  image: '',
}

function formFrom(product: AdminProduct): ProductInput {
  return {
    name: product.name,
    description: product.description ?? '',
    price: String(product.price).replace('.', ','),
    category: product.category ?? '',
    theme: product.theme ?? '',
    material: product.material ?? '',
    minStock: String(product.minStock),
    initialStock: '',
    image: product.image ?? '',
  }
}

export default function Products() {
  const { reload: reloadCatalog } = useProducts()
  const [products, setProducts] = useState<AdminProduct[] | null>(null)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [editing, setEditing] = useState<AdminProduct | 'novo' | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [formError, setFormError] = useState<ErrorInfo | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    listAdminProducts()
      .then((list) => {
        setProducts(list)
        setError(null)
      })
      .catch((err) => setError(errorDetails(err)))
  }, [])

  useEffect(load, [load])

  function refresh() {
    load()
    reloadCatalog()
  }

  function openForm(product: AdminProduct | 'novo') {
    setEditing(product)
    setForm(product === 'novo' ? emptyForm : formFrom(product))
    setFormError(null)
    window.scrollTo({ top: 0 })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      if (editing === 'novo') await createProduct(form)
      else if (editing) await updateProduct(editing, form)
      setEditing(null)
      refresh()
    } catch (err) {
      setFormError(errorDetails(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleHidden(product: AdminProduct, hidden: boolean) {
    try {
      await setProductHidden(product.id, hidden)
      refresh()
    } catch (err) {
      setError(errorDetails(err))
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`Excluir "${product.name}"? Não dá para desfazer.`)) return
    try {
      await deleteProduct(product.id)
      refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        if (window.confirm(`${err.message}\n\nQuer ocultar "${product.name}" do catálogo em vez de excluir?`)) {
          await handleHidden(product, true)
        }
      } else {
        setError(errorDetails(err))
      }
    }
  }

  const set = (field: keyof ProductInput) => (event: { target: { value: string } }) =>
    setForm({ ...form, [field]: event.target.value })

  return (
    <>
      <div className="admin__head">
        <h1>Produtos</h1>
        {editing ? (
          <button type="button" className="button button--ghost" onClick={() => setEditing(null)}>
            <XIcon size={18} aria-hidden />
            Cancelar
          </button>
        ) : (
          <button type="button" className="button" onClick={() => openForm('novo')}>
            <PlusIcon size={18} weight="bold" aria-hidden />
            Adicionar produto
          </button>
        )}
      </div>

      {editing && (
        <form className="panel form form--grid" onSubmit={handleSubmit} aria-labelledby="form-produto">
          <h2 id="form-produto" className="form__wide">
            {editing === 'novo' ? 'Novo produto' : `Editar ${editing.name}`}
          </h2>
          <label className="form__wide">
            Nome
            <input required minLength={2} maxLength={150} value={form.name} onChange={set('name')} />
          </label>
          <label className="form__wide">
            Descrição (opcional)
            <input value={form.description} onChange={set('description')} placeholder="Ex.: porcelana 325 ml" />
          </label>
          <label className="form__wide">
            Foto principal (endereço da imagem, opcional)
            <input type="url" value={form.image} onChange={set('image')} placeholder="https://…/caneca.png" />
          </label>
          <label>
            Preço (R$)
            <input required inputMode="decimal" value={form.price} onChange={set('price')} placeholder="36,90" />
          </label>
          <label>
            Tema (aparece no menu da loja)
            <input value={form.theme} onChange={set('theme')} placeholder="Gamer" />
          </label>
          <label>
            Categoria (opcional)
            <input value={form.category} onChange={set('category')} placeholder="Caneca" />
          </label>
          <label>
            Material (opcional)
            <input value={form.material} onChange={set('material')} placeholder="Porcelana" />
          </label>
          <label>
            Estoque mínimo
            <input type="number" min="0" step="1" value={form.minStock} onChange={set('minStock')} placeholder="0" />
          </label>
          {editing === 'novo' && (
            <label>
              Estoque inicial
              <input
                type="number"
                min="0"
                step="1"
                value={form.initialStock}
                onChange={set('initialStock')}
                placeholder="0"
              />
            </label>
          )}
          <div className="form__wide">
            <ErrorBox error={formError} />
          </div>
          <button type="submit" className="button form__submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar produto'}
          </button>
        </form>
      )}

      <ErrorBox error={error} />

      {!error && !products && <p className="admin__loading">Carregando produtos…</p>}

      {products && products.length === 0 && (
        <p className="panel panel__empty">Nenhum produto cadastrado. Adicione o primeiro para ele aparecer na loja.</p>
      )}

      {products && products.length > 0 && (
        <>
          <p className="admin__hint">
            O estoque muda pela página <Link to="/admin/estoque">Estoque</Link> e pelos pedidos marcados como pagos ou
            cancelados. Produto oculto não aparece na loja.
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">Foto</span>
                  </th>
                  <th>Produto</th>
                  <th className="num">Preço</th>
                  <th className="num">Estoque</th>
                  <th>Na loja</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="table__photo">
                      <ProductTile image={p.image} small />
                    </td>
                    <td>
                      <strong className="table__name">{p.name}</strong>
                      {p.theme && <span className="table__sub">{p.theme}</span>}
                    </td>
                    <td className="num">{formatPrice(p.price)}</td>
                    <td className={`num${p.stock <= p.minStock ? ' is-low' : ''}`}>{p.stock} un.</td>
                    <td>
                      <label className="switch">
                        <input type="checkbox" checked={!p.hidden} onChange={(e) => handleHidden(p, !e.target.checked)} />
                        <span>{p.hidden ? 'Oculto' : 'Visível'}</span>
                      </label>
                    </td>
                    <td className="num table__actions">
                      <button
                        type="button"
                        className="icon-button icon-button--edit"
                        onClick={() => openForm(p)}
                        aria-label={`Editar ${p.name}`}
                      >
                        <PencilSimpleIcon size={20} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleDelete(p)}
                        aria-label={`Excluir ${p.name}`}
                      >
                        <TrashIcon size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
