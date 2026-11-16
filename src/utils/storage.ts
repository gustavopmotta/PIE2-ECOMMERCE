// Leitura e escrita no localStorage que não quebram se ele estiver indisponível.
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sem armazenamento: o estado vive só na memória
  }
}

export function removeStorage(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // nada a fazer
  }
}
