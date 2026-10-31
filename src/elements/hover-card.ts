import type { Placement } from '@floating-ui/dom'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { float } from '../lib/floating'
import { isPopoverOpen } from '../lib/popover'
import { define } from './define'
import { popoverStyles } from './styles'

export class LumenHoverCard extends LitElement {
  static properties = {
    openDelay: { type: Number, attribute: 'open-delay' },
    closeDelay: { type: Number, attribute: 'close-delay' },
    placement: {},
    pinned: { type: Boolean, reflect: true },
  }

  static styles = [
    popoverStyles,
    css`
      :host {
        display: contents;
      }

      [popover] {
        box-sizing: border-box;
        inline-size: var(--lu-hover-card-width, 24rem);
        max-inline-size: calc(100vw - 1rem);
        padding: var(--lu-space-3);
        border-radius: var(--lu-radius-lg);
      }
    `,
  ]

  declare openDelay: number
  declare closeDelay: number
  declare placement: Placement
  declare pinned: boolean
  private timer?: ReturnType<typeof setTimeout>
  private stopFloating?: () => void

  constructor() {
    super()
    this.openDelay = 700
    this.closeDelay = 300
    this.placement = 'bottom-end'
    this.pinned = false
  }

  private get trigger(): Element | undefined {
    return this.renderRoot.querySelector<HTMLSlotElement>('slot[name="trigger"]')?.assignedElements()[0]
  }

  private get panel(): HTMLElement | null {
    return this.renderRoot.querySelector('[popover]')
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('pinned')) {
      if (this.pinned) {
        this.show()
      } else {
        this.scheduleHide()
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.hide()
  }

  private scheduleShow() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.show(), this.openDelay)
  }

  private scheduleHide() {
    clearTimeout(this.timer)
    if (!this.pinned) {
      this.timer = setTimeout(() => this.hide(), this.closeDelay)
    }
  }

  private show() {
    clearTimeout(this.timer)
    const trigger = this.trigger
    const panel = this.panel
    if (!trigger || !panel || isPopoverOpen(panel)) {
      return
    }
    panel.showPopover()
    this.stopFloating = float(trigger, panel, { placement: this.placement, gap: 6 })
  }

  private hide() {
    clearTimeout(this.timer)
    this.stopFloating?.()
    this.stopFloating = undefined
    if (isPopoverOpen(this.panel)) {
      this.panel?.hidePopover()
    }
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !this.pinned) {
      this.hide()
    }
  }

  render() {
    return html`
      <slot
        name="trigger"
        @pointerenter=${this.scheduleShow}
        @pointerleave=${this.scheduleHide}
        @focusin=${this.scheduleShow}
        @focusout=${this.scheduleHide}
        @keydown=${this.onKeydown}
      ></slot>
      <div
        popover="manual"
        part="card"
        @pointerenter=${this.show}
        @pointerleave=${this.scheduleHide}
        @focusin=${this.show}
        @focusout=${this.scheduleHide}
        @keydown=${this.onKeydown}
      >
        <slot></slot>
      </div>
    `
  }
}

define('lu-hover-card', LumenHoverCard)

declare global {
  interface HTMLElementTagNameMap {
    'lu-hover-card': LumenHoverCard
  }
}
