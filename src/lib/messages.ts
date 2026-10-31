import type { ReactiveController, ReactiveControllerHost } from 'lit'

export interface LumenMessages {
  close: string
  cancel: string
  clear: string
  notifications: string
  loading: string
  draggable: string
  dragPickedUp: (params: { item: string }) => string
  dragOver: (params: { zone: string }) => string
  dragDropped: (params: { zone: string }) => string
  dragDroppedOutside: string
  dragCancelled: string
}

export type LumenMessageKey = keyof LumenMessages

type TextKey = { [Key in LumenMessageKey]: LumenMessages[Key] extends string ? Key : never }[LumenMessageKey]
type FormatKey = Exclude<LumenMessageKey, TextKey>
type Params<Key extends FormatKey> = Parameters<LumenMessages[Key]>[0]
export const lumenMessageKeys = [
  'close',
  'cancel',
  'clear',
  'notifications',
  'loading',
  'draggable',
  'dragPickedUp',
  'dragOver',
  'dragDropped',
  'dragDroppedOutside',
  'dragCancelled',
] as const satisfies readonly LumenMessageKey[]

interface Listener {
  requestUpdate(): void
}

interface Registry {
  messages: Map<string, LumenMessages>
  listeners: Set<Listener>
  observer: MutationObserver | null
}

const registryKey = Symbol.for('@slashome/lumen/messages')

function registry(): Registry {
  const host = globalThis as unknown as Record<symbol, Registry | undefined>
  host[registryKey] ??= { messages: new Map(), listeners: new Set(), observer: null }
  return host[registryKey]
}

function normalize(lang: string): string {
  return lang.trim().toLowerCase()
}

function notify() {
  registry().listeners.forEach((listener) => listener.requestUpdate())
}
export function registerLumenMessages(lang: string, messages: LumenMessages): void {
  registry().messages.set(normalize(lang), messages)
  notify()
}

export function messagesFor(lang: string): LumenMessages | undefined {
  const messages = registry().messages
  const wanted = normalize(lang)
  return messages.get(wanted) ?? messages.get(wanted.split('-')[0] ?? '')
}

export function documentLang(): string {
  return typeof document === 'undefined' ? '' : document.documentElement.lang
}

export function langOf(element: Element): string {
  return element.closest('[lang]')?.getAttribute('lang') ?? documentLang()
}

function observeLang() {
  const state = registry()
  if (state.observer || typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
    return
  }
  state.observer = new MutationObserver(notify)
  state.observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'], subtree: true })
}

export function subscribeToMessages(listener: Listener): () => void {
  observeLang()
  registry().listeners.add(listener)
  return () => registry().listeners.delete(listener)
}

const reported = new WeakMap<object, Set<string>>()

export function reportMissing(owner: object, name: string, key: string, lang: string, attribute?: string) {
  const id = `${key}|${lang}`
  const seen = reported.get(owner) ?? new Set<string>()
  reported.set(owner, seen)
  if (seen.has(id)) {
    return
  }
  seen.add(id)
  const instead = attribute ? `set ${attribute} on the element, or ` : ''
  console.error(
    `[lumen] <${name}> has no label for "${key}" in language "${lang || '(none)'}": ${instead}register it with registerLumenMessages("${lang || '<lang>'}", messages).`,
  )
}

export function reportMissingAttribute(owner: object, name: string, attribute: string) {
  const seen = reported.get(owner) ?? new Set<string>()
  reported.set(owner, seen)
  if (seen.has(attribute)) {
    return
  }
  seen.add(attribute)
  console.error(`[lumen] <${name}> needs ${attribute}: this label is given per instance and has no registered default.`)
}

export class MessagesController implements ReactiveController {
  private unsubscribe?: () => void

  constructor(private host: ReactiveControllerHost & HTMLElement) {
    host.addController(this)
  }

  hostConnected() {
    this.unsubscribe = subscribeToMessages(this.host)
  }

  hostDisconnected() {
    this.unsubscribe?.()
  }

  text(key: TextKey, own?: string | null, attribute?: string): string | undefined {
    if (own) {
      return own
    }
    const lang = langOf(this.host)
    const found = messagesFor(lang)?.[key]
    if (!found) {
      reportMissing(this.host, this.host.localName, key, lang, attribute)
    }
    return found || undefined
  }

  format<Key extends FormatKey>(key: Key, params: Params<Key>): string {
    const lang = langOf(this.host)
    const found = messagesFor(lang)?.[key] as ((params: Params<Key>) => string) | undefined
    if (!found) {
      reportMissing(this.host, this.host.localName, key, lang)
      return ''
    }
    return found(params)
  }

  required(own: string | null | undefined, attribute: string): string | undefined {
    if (!own) {
      reportMissingAttribute(this.host, this.host.localName, attribute)
    }
    return own || undefined
  }
}
