import type { Placement } from '@floating-ui/dom'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { float } from '../../lib/floating'
import { isPopoverOpen } from '../../lib/popover'
import { define } from '../../lib/define'
import { popoverStyles } from '../../lib/styles'

export class LumenTooltip extends LitElement {
  static properties = {
    content: {},
    delay: { type: Number },
    placement: {},
  }

  static styles = [
    popoverStyles,
    css`
      :host {
        display: contents;
      }

      [popover] {
        max-inline-size: 28rem;
        padding: var(--lu-space-1) var(--lu-space-2);
        font-family: var(--lu-font-family-mono);
        font-size: var(--lu-font-size-xs);
        white-space: pre-line;
        box-shadow: var(--lu-shadow-md);
        pointer-events: none;
      }
    `,
  ]

  declare content: string
  declare delay: number
  declare placement: Placement
  private timer?: ReturnType<typeof setTimeout>
  private stopFloating?: () => void

  constructor() {
    super()
    this.content = ''
    this.delay = 200
    this.placement = 'top'
    this.addEventListener('pointerenter', () => this.schedule())
    this.addEventListener('pointerleave', () => this.hide())
    this.addEventListener('focusin', () => this.schedule())
    this.addEventListener('focusout', () => this.hide())
    this.addEventListener('keydown', (event) => event.key === 'Escape' && this.hide())
  }

  private get trigger(): Element | undefined {
    return this.renderRoot.querySelector('slot')?.assignedElements()[0]
  }

  private get panel(): HTMLElement | null {
    return this.renderRoot.querySelector('[popover]')
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('content')) {
      this.describeTrigger()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.hide()
  }

  private describeTrigger() {
    this.trigger?.setAttribute('aria-description', this.content)
  }

  private schedule() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.show(), this.delay)
  }

  private show() {
    const trigger = this.trigger
    const panel = this.panel
    if (!trigger || !panel || !this.content) {
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

  render() {
    return html`<slot @slotchange=${this.describeTrigger}></slot>
      <div popover="manual" role="tooltip" part="tooltip">${this.content}</div>`
  }
}

define('lu-tooltip', LumenTooltip)

declare global {
  interface HTMLElementTagNameMap {
    'lu-tooltip': LumenTooltip
  }
}
