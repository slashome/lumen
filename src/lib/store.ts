export interface Store<Value> {
  get(): Value
  set(value: Value): void
  subscribe(listener: (value: Value) => void): () => void
}

export function createStore<Value>(initial: Value): Store<Value> {
  let current = initial
  const listeners = new Set<(value: Value) => void>()
  return {
    get: () => current,
    set(value) {
      current = value
      listeners.forEach((listener) => listener(current))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
