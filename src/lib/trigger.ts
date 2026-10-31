import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { reportMissingAttribute } from './messages'

export interface Triggered extends ReactiveControllerHost, HTMLElement {
  htmlFor: string
  anchor: Element | null
}

type Root = Document | ShadowRoot

interface Watch {
  observer: MutationObserver
  listeners: Set<() => void>
}

const watches = new WeakMap<Root, Watch>()

function watch(root: Root, listener: () => void): () => void {
  let entry = watches.get(root)
  if (!entry) {
    const listeners = new Set<() => void>()
    const observer = new MutationObserver(() => listeners.forEach((each) => each()))
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['id'] })
    entry = { observer, listeners }
    watches.set(root, entry)
  }
  entry.listeners.add(listener)
  return () => {
    entry.listeners.delete(listener)
    if (entry.listeners.size === 0) {
      entry.observer.disconnect()
      watches.delete(root)
    }
  }
}

function rootOf(element: Element): Root | null {
  const root = element.getRootNode()
  return root instanceof Document || root instanceof ShadowRoot ? root : null
}

let instances = 0

export function ensureId(element: Element, prefix: string): string {
  if (!element.id) {
    instances += 1
    element.id = `${prefix}-${instances}`
  }
  return element.id
}

function tokens(value: string | null): string[] {
  return (value ?? '').split(/\s+/).filter(Boolean)
}

type ElementsReflection = 'ariaDescribedByElements' | 'ariaControlsElements'

export function referTo(trigger: Element, attribute: 'aria-describedby' | 'aria-controls', target: Element): () => void {
  if (rootOf(trigger) === rootOf(target)) {
    const id = target.id
    const current = tokens(trigger.getAttribute(attribute))
    if (!current.includes(id)) {
      trigger.setAttribute(attribute, [...current, id].join(' '))
    }
    return () => {
      const rest = tokens(trigger.getAttribute(attribute)).filter((token) => token !== id)
      if (rest.length > 0) {
        trigger.setAttribute(attribute, rest.join(' '))
      } else {
        trigger.removeAttribute(attribute)
      }
    }
  }
  const reflection: ElementsReflection = attribute === 'aria-describedby' ? 'ariaDescribedByElements' : 'ariaControlsElements'
  if (!(reflection in trigger)) {
    return () => {}
  }
  const host = trigger as unknown as Record<ElementsReflection, Element[] | null>
  host[reflection] = [...(host[reflection] ?? []), target]
  return () => {
    const rest = (host[reflection] ?? []).filter((element) => element !== target)
    host[reflection] = rest.length > 0 ? rest : null
  }
}

export class TriggerController implements ReactiveController {
  private current: Element | null = null
  private unbind?: () => void
  private unwatch?: () => void
  private watchedRoot: Root | null = null

  constructor(
    private host: Triggered,
    private bind: (trigger: Element) => () => void,
  ) {
    host.addController(this)
  }

  get trigger(): Element | null {
    return this.current
  }

  hostConnected() {
    this.resolve()
  }

  hostUpdated() {
    if (!this.host.htmlFor && !this.host.anchor) {
      reportMissingAttribute(this.host, this.host.localName, 'for (or the anchor property)', 'it names the element that the component is bound to')
    }
    this.resolve()
  }

  hostDisconnected() {
    this.stopWatching()
    this.attach(null)
  }

  private resolve() {
    if (!this.host.isConnected) {
      return
    }
    const root = rootOf(this.host)
    const byId = !this.host.anchor && this.host.htmlFor
    if (byId && root) {
      this.startWatching(root)
    } else {
      this.stopWatching()
    }
    this.attach(this.host.anchor ?? (byId && root ? root.getElementById(this.host.htmlFor) : null))
  }

  private attach(trigger: Element | null) {
    if (trigger === this.current) {
      return
    }
    this.unbind?.()
    this.unbind = undefined
    this.current = trigger
    if (trigger) {
      this.unbind = this.bind(trigger)
    }
  }

  private startWatching(root: Root) {
    if (this.watchedRoot === root) {
      return
    }
    this.stopWatching()
    this.watchedRoot = root
    this.unwatch = watch(root, () => this.resolve())
  }

  private stopWatching() {
    this.unwatch?.()
    this.unwatch = undefined
    this.watchedRoot = null
  }
}
