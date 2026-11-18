type StorageKind = 'local' | 'session'

const storageFor = (kind: StorageKind) => (kind === 'session' ? window.sessionStorage : window.localStorage)

export function readStorage<T>(key: string, fallback: T, kind: StorageKind = 'local'): T {
  try {
    const raw = storageFor(kind).getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown, kind: StorageKind = 'local') {
  try {
    storageFor(kind).setItem(key, JSON.stringify(value))
  } catch {
    // ignora
  }
}

export function removeStorage(key: string, kind: StorageKind = 'local') {
  try {
    storageFor(kind).removeItem(key)
  } catch {
    // ignora
  }
}
