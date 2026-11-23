import { API_URL } from '../config.ts'

export class ApiError extends Error {
  status: number
  details: string[]

  constructor(message: string, status: number, details: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export async function request<T>(path: string, { method = 'GET', body, auth = false }: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiError('O endereço da API não está configurado. Preencha o VITE_API_URL no arquivo .env.', 0)
  }

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('O servidor não respondeu. Confira se a API está rodando e tente de novo.', 0)
  }

  if (response.status === 204) return undefined as T

  const data = (await response.json().catch(() => null)) as { erro?: string; detalhes?: string[] } | null
  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized?.()
    throw new ApiError(data?.erro ?? `A API respondeu com erro ${response.status}.`, response.status, data?.detalhes ?? [])
  }
  return data as T
}

export function errorDetails(error: unknown): { message: string; details: string[] } {
  if (error instanceof ApiError) return { message: error.message, details: error.details }
  return { message: 'Algo deu errado. Tente de novo.', details: [] }
}
