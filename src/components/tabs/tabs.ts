import { css, html, LitElement } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import type { ValueChangeDetail } from '../../lib/change'

let instances = 0

const steps: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }

function isEnabled(tab: HTMLElement | undefined): tab is HTMLElement {
  return tab !== undefined && !tab.hasAttribute('disabled')
}

/**
 * Tabs on the ARIA tabs pattern. The tabs are the children in `slot="tab"`, usually `<button>`s with a `value`; the panels are the other children, in the same order: the first tab shows the first panel. The element gives them their roles, ids, `aria-selected`, `aria-controls`, `aria-labelledby` and `hidden`.
 *
 * One tab is always selected: the one whose `value` matches, or the first. The arrow keys move between the tabs and wrap, `Home` and `End` reach the first and the last, and disabled tabs are skipped. By default a tab is selected as soon as it gets the focus; with `manual`, the arrows only move the focus and `Enter` or `Space` selects.
 *
 * It fires `lu-value-change` when the user selects a tab, then sets its own `value` unless a listener cancels the event.
 *
 * @summary Tabs that show one panel at a time.
 * @tag lu-tabs
 * @slot - The panels, one per tab, in the order of the tabs.
 * @slot tab - The tabs, usually `<button value>`. A tab without `value` takes its position, from `0`.
 * @csspart tablist - The row that holds the tabs.
 * @fires {CustomEvent<ValueChangeDetail>} lu-value-change - The user selected a tab other than the current one. `detail.value` is its value, `detail.source` is `option`. Cancelable: `preventDefault()` keeps the current `value`, which the element still holds while the event runs.
 */
export class LumenTabs extends LitElement {
  static properties = {
    label: {},
    value: { reflect: true },
    manual: { type: Boolean, reflect: true },
  }

  static styles = css`
    :host {
      display: block;
    }

    .tablist {
      display: flex;
      gap: var(--lu-space-1);
      overflow-x: auto;
      border-block-end: 1px solid var(--lu-color-border);
    }

    ::slotted([slot='tab']) {
      flex-shrink: 0;
      margin: 0 0 -1px;
      padding: var(--lu-space-2) var(--lu-space-3);
      border: 0;
      border-block-end: 2px solid transparent;
      background: none;
      color: var(--lu-color-muted-foreground);
      font: inherit;
      font-size: var(--lu-font-size-sm);
      font-weight: var(--lu-font-weight-medium);
      white-space: nowrap;
      cursor: pointer;
      transition:
        color var(--lu-motion-hover-duration) var(--lu-motion-hover-easing),
        border-color var(--lu-motion-hover-duration) var(--lu-motion-hover-easing);
    }

    ::slotted([slot='tab']:hover) {
      color: var(--lu-color-foreground);
    }

    ::slotted([slot='tab'][aria-selected='true']) {
      border-block-end-color: var(--lu-color-primary);
      color: var(--lu-color-foreground);
    }

    ::slotted([slot='tab']:focus-visible) {
      outline: 2px solid var(--lu-color-ring);
      outline-offset: -2px;
    }

    ::slotted([slot='tab']:disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    ::slotted(:not([slot])) {
      padding-block-start: var(--lu-space-3);
    }

    ::slotted(:not([slot]):focus-visible) {
      outline: 2px solid var(--lu-color-ring);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      ::slotted([slot='tab']) {
        transition: none;
      }
    }
  `

  /** The accessible name of the tab list. */
  declare label: string
  /** The value of the selected tab. When no tab has it, the first tab is selected. */
  declare value: string | null
  /** Whether the arrow keys only move the focus, leaving `Enter` or `Space` to select. Off by default: the focused tab is selected. */
  declare manual: boolean

  private readonly idPrefix = `lu-tabs-${(instances += 1)}`

  constructor() {
    super()
    this.label = ''
    this.value = null
    this.manual = false
  }

  private get tabs(): HTMLElement[] {
    return [...this.children].filter((child): child is HTMLElement => child instanceof HTMLElement && child.slot === 'tab')
  }

  private get panels(): HTMLElement[] {
    return [...this.children].filter((child): child is HTMLElement => child instanceof HTMLElement && child.slot === '')
  }

  private tabValue(tab: HTMLElement, index: number): string {
    return tab.getAttribute('value') ?? String(index)
  }

  private get selectedIndex(): number {
    const index = this.tabs.findIndex((tab, position) => this.tabValue(tab, position) === this.value)
    return index < 0 ? 0 : index
  }

  private sync() {
    const selected = this.selectedIndex
    const panels = this.panels
    this.tabs.forEach((tab, index) => {
      const panel = panels[index]
      tab.id ||= `${this.idPrefix}-tab-${index}`
      tab.setAttribute('role', 'tab')
      if (tab instanceof HTMLButtonElement && !tab.hasAttribute('type')) {
        tab.type = 'button'
      }
      tab.setAttribute('aria-selected', String(index === selected))
      tab.tabIndex = index === selected ? 0 : -1
      if (panel) {
        panel.id ||= `${this.idPrefix}-panel-${index}`
        tab.setAttribute('aria-controls', panel.id)
      }
    })
    panels.forEach((panel, index) => {
      const tab = this.tabs[index]
      panel.setAttribute('role', 'tabpanel')
      panel.tabIndex = 0
      panel.hidden = index !== selected
      if (tab) {
        panel.setAttribute('aria-labelledby', tab.id)
      }
    })
  }

  private select(tab: HTMLElement) {
    const index = this.tabs.indexOf(tab)
    const value = this.tabValue(tab, index)
    if (index === this.selectedIndex) {
      return
    }
    if (emit<ValueChangeDetail>(this, 'lu-value-change', { value, source: 'option' }, { cancelable: true })) {
      this.value = value
    }
  }

  private tabOf(event: Event): HTMLElement | undefined {
    return this.tabs.find((tab) => event.composedPath().includes(tab))
  }

  private onClick(event: MouseEvent) {
    const tab = this.tabOf(event)
    if (isEnabled(tab)) {
      this.select(tab)
    }
  }

  private target(key: string, from: HTMLElement): HTMLElement | undefined {
    const tabs = this.tabs
    if (key === 'Home') {
      return tabs.find(isEnabled)
    }
    if (key === 'End') {
      return tabs.findLast(isEnabled)
    }
    const step = steps[key]
    if (step === undefined) {
      return undefined
    }
    const start = tabs.indexOf(from)
    for (let offset = 1; offset < tabs.length; offset += 1) {
      const candidate = tabs[(start + step * offset + tabs.length * offset) % tabs.length]
      if (isEnabled(candidate)) {
        return candidate
      }
    }
    return undefined
  }

  private onKeydown(event: KeyboardEvent) {
    const tab = this.tabOf(event)
    const next = tab && this.target(event.key, tab)
    if (!next) {
      return
    }
    event.preventDefault()
    next.focus()
    if (!this.manual) {
      this.select(next)
    }
  }

  updated() {
    this.sync()
  }

  render() {
    return html`
      <div class="tablist" role="tablist" aria-label=${this.label} part="tablist" @click=${this.onClick} @keydown=${this.onKeydown}>
        <slot name="tab" @slotchange=${() => this.sync()}></slot>
      </div>
      <slot @slotchange=${() => this.sync()}></slot>
    `
  }
}

define('lu-tabs', LumenTabs)

declare global {
  interface HTMLElementTagNameMap {
    'lu-tabs': LumenTabs
  }
}
