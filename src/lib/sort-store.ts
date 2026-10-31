import { parseSort, type TableSort } from './sort'
import type { Store } from './store'

const fallback = new Map<string, string | null>()
const listeners = new Map<string, Set<(sort: TableSort | null) => void>>()

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return fallback.get(key) ?? null
  }
}

function persist(key: string, raw: string | null): boolean {
  try {
    if (raw === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, raw)
    }
    return true
  } catch {
    return false
  }
}

export function storedSort(key: string): Store<TableSort | null> {
  return {
    get: () => parseSort(read(key)),
    set(sort) {
      const raw = sort === null ? null : JSON.stringify(sort)
      if (!persist(key, raw)) {
        fallback.set(key, raw)
      }
      listeners.get(key)?.forEach((listener) => listener(sort))
    },
    subscribe(listener) {
      const forKey = listeners.get(key) ?? new Set()
      forKey.add(listener)
      listeners.set(key, forKey)
      return () => forKey.delete(listener)
    },
  }
}
