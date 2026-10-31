import { createStore } from './store'

export type ToastKind = 'default' | 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
  duration: number
}

export interface ToastOptions {
  duration?: number
}

export const toasts = createStore<readonly Toast[]>([])

const defaultDuration = 4000
let nextId = 1

function show(kind: ToastKind, message: string, options: ToastOptions = {}): number {
  const id = nextId++
  toasts.set([...toasts.get(), { id, kind, message, duration: options.duration ?? defaultDuration }])
  return id
}

export function dismiss(id: number) {
  toasts.set(toasts.get().filter((entry) => entry.id !== id))
}

export const toast = Object.assign((message: string, options?: ToastOptions) => show('default', message, options), {
  success: (message: string, options?: ToastOptions) => show('success', message, options),
  error: (message: string, options?: ToastOptions) => show('error', message, options),
  info: (message: string, options?: ToastOptions) => show('info', message, options),
  warning: (message: string, options?: ToastOptions) => show('warning', message, options),
  dismiss,
})
