import type {
  AdminProduct,
  CartItem,
  MovementType,
  Order,
  OrderLine,
  OrderStatus,
  Product,
  ProductInput,
  Role,
  StockMovement,
  User,
} from '../types/index.ts'
import { request } from './http.ts'

// Formatos que a API devolve (campos em snake_case, como no banco).
interface ApiUser {
  id: number
  nome: string
  email: string
  telefone: string | null
  perfil: Role
}

interface ApiProduct {
  id: number
  nome: string
  descricao: string | null
  preco: number
  categoria: string | null
  tema: string | null
  material: string | null
  disponivel?: boolean
  quantidade_estoque?: number
  estoque_minimo?: number
  oculto?: boolean
  foto_principal: string | null
}

interface ApiOrderItem {
  produto_id: number
  produto_nome: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

interface ApiOrder {
  id: number
  status: OrderStatus
  total: number
  observacao?: string | null
  criado_em: string
  cliente?: { nome: string | null; email: string | null; telefone: string | null }
  itens?: ApiOrderItem[]
}

interface ApiMovement {
  id: number
  produto_id: number
  produto_nome: string
  tipo: MovementType
  quantidade: number
  motivo: string | null
  pedido_id: number | null
  usuario_nome: string | null
  criado_em: string
}

const toUser = (u: ApiUser): User => ({ id: u.id, name: u.nome, email: u.email, phone: u.telefone, role: u.perfil })

const toProduct = (p: ApiProduct): Product => ({
  id: p.id,
  name: p.nome,
  description: p.descricao,
  price: p.preco,
  category: p.categoria,
  theme: p.tema,
  material: p.material,
  available: p.disponivel ?? false,
  image: p.foto_principal,
})

const toAdminProduct = (p: ApiProduct): AdminProduct => ({
  id: p.id,
  name: p.nome,
  description: p.descricao,
  price: p.preco,
  category: p.categoria,
  theme: p.tema,
  material: p.material,
  image: p.foto_principal,
  stock: p.quantidade_estoque ?? 0,
  minStock: p.estoque_minimo ?? 0,
  hidden: p.oculto ?? false,
})

const toLine = (i: ApiOrderItem): OrderLine => ({
  productId: i.produto_id,
  name: i.produto_nome,
  quantity: i.quantidade,
  unitPrice: i.preco_unitario,
  subtotal: i.subtotal,
})

const toOrder = (o: ApiOrder): Order => ({
  id: o.id,
  status: o.status,
  total: o.total,
  note: o.observacao ?? null,
  createdAt: o.criado_em,
  customer: o.cliente ? { name: o.cliente.nome, email: o.cliente.email, phone: o.cliente.telefone } : null,
  lines: o.itens ? o.itens.map(toLine) : null,
})

const toMovement = (m: ApiMovement): StockMovement => ({
  id: m.id,
  productId: m.produto_id,
  productName: m.produto_nome,
  type: m.tipo,
  quantity: m.quantidade,
  reason: m.motivo,
  orderId: m.pedido_id,
  userName: m.usuario_nome,
  createdAt: m.criado_em,
})

// ---------- contas ----------

export async function login(email: string, password: string) {
  const data = await request<{ token: string; usuario: ApiUser }>('/login', {
    method: 'POST',
    body: { email, senha: password },
  })
  return { token: data.token, user: toUser(data.usuario) }
}

export interface NewAccount {
  name: string
  email: string
  phone: string
  password: string
}

export async function register(account: NewAccount) {
  const data = await request<{ usuario: ApiUser }>('/usuarios', {
    method: 'POST',
    body: { nome: account.name, email: account.email, telefone: account.phone, senha: account.password },
  })
  return toUser(data.usuario)
}

export async function fetchMe() {
  const data = await request<{ usuario: ApiUser }>('/me', { auth: true })
  return toUser(data.usuario)
}

// ---------- catálogo ----------

export async function listProducts() {
  const data = await request<{ produtos: ApiProduct[] }>('/produtos')
  return data.produtos.map(toProduct)
}

// ---------- pedidos do cliente ----------

export async function createOrder(items: CartItem[], note: string) {
  const data = await request<{ pedido: ApiOrder }>('/pedidos', {
    method: 'POST',
    auth: true,
    body: {
      itens: items.map((item) => ({ produto_id: item.productId, quantidade: item.quantity })),
      observacao: note.trim() || undefined,
    },
  })
  return toOrder(data.pedido)
}

export async function listMyOrders() {
  const data = await request<{ pedidos: ApiOrder[] }>('/pedidos/meus', { auth: true })
  return data.pedidos.map(toOrder)
}

export async function getOrder(id: number) {
  const data = await request<{ pedido: ApiOrder }>(`/pedidos/${id}`, { auth: true })
  return toOrder(data.pedido)
}

// ---------- painel: produtos ----------

export async function listAdminProducts() {
  const data = await request<{ produtos: ApiProduct[] }>('/admin/produtos', { auth: true })
  return data.produtos.map(toAdminProduct)
}

function productBody(input: ProductInput, creating: boolean) {
  const optional = (value: string) => value.trim() || null
  const integer = (value: string) => (value.trim() === '' ? undefined : Number(value))
  return {
    nome: input.name.trim(),
    preco: input.price.trim(),
    descricao: optional(input.description),
    categoria: optional(input.category),
    tema: optional(input.theme),
    material: optional(input.material),
    estoque_minimo: integer(input.minStock),
    ...(creating ? { estoque_inicial: integer(input.initialStock) } : {}),
  }
}

async function addPhoto(productId: number, url: string) {
  await request(`/admin/produtos/${productId}/fotos`, {
    method: 'POST',
    auth: true,
    body: { url, principal: true },
  })
}

export async function createProduct(input: ProductInput) {
  const data = await request<{ produto: ApiProduct }>('/admin/produtos', {
    method: 'POST',
    auth: true,
    body: productBody(input, true),
  })
  if (input.image.trim()) await addPhoto(data.produto.id, input.image.trim())
}

export async function updateProduct(product: AdminProduct, input: ProductInput) {
  await request(`/admin/produtos/${product.id}`, { method: 'PUT', auth: true, body: productBody(input, false) })
  const image = input.image.trim()
  if (image && image !== product.image) await addPhoto(product.id, image)
}

export async function setProductHidden(id: number, hidden: boolean) {
  await request(`/admin/produtos/${id}/oculto`, { method: 'PATCH', auth: true, body: { oculto: hidden } })
}

export async function deleteProduct(id: number) {
  await request(`/admin/produtos/${id}`, { method: 'DELETE', auth: true })
}

// ---------- painel: pedidos ----------

export async function listAdminOrders() {
  const data = await request<{ pedidos: ApiOrder[] }>('/admin/pedidos', { auth: true })
  return data.pedidos.map(toOrder)
}

export async function getAdminOrder(id: number) {
  const data = await request<{ pedido: ApiOrder }>(`/admin/pedidos/${id}`, { auth: true })
  return toOrder(data.pedido)
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const data = await request<{ pedido: ApiOrder }>(`/admin/pedidos/${id}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  })
  return toOrder(data.pedido)
}

// ---------- painel: estoque ----------

export async function listMovements() {
  const data = await request<{ movimentacoes: ApiMovement[] }>('/admin/estoque/movimentacoes?limite=200', {
    auth: true,
  })
  return data.movimentacoes.map(toMovement)
}

export interface NewMovement {
  productId: number
  type: 'entrada' | 'ajuste'
  quantity: number
  reason: string
}

export async function createMovement(movement: NewMovement) {
  const data = await request<{ produto: { nome: string; quantidade_estoque: number } }>(
    '/admin/estoque/movimentacoes',
    {
      method: 'POST',
      auth: true,
      body: {
        produto_id: movement.productId,
        tipo: movement.type,
        quantidade: movement.quantity,
        motivo: movement.reason.trim(),
      },
    },
  )
  return { productName: data.produto.nome, stock: data.produto.quantidade_estoque }
}
