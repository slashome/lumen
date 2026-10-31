import type { Placement } from '@floating-ui/dom'
import { css, html, LitElement, type PropertyValues } from 'lit'
import type { OpenChangeDetail, OpenChangeSource } from '../../lib/change'
import { emit } from '../../lib/emit'
import { float } from '../../lib/floating'
import { isPopoverOpen } from '../../lib/popover'
import { define } from '../../lib/define'
import { popoverStyles } from '../../lib/styles'

export type { OpenChangeDetail } from '../../lib/change'

/**
 * Shows a short text next to its trigger on hover and focus, after a delay, in the top layer. The text also describes the trigger for assistive technology through `aria-description`.
 *
 * The tooltip opens and closes itself: it fires a cancelable `lu-open-change`, then sets `open` unless a listener called `preventDefault()`. To control it, cancel the event and set `open` yourself.
 *
 * The tooltip never holds interactive content: use `lu-hover-card` for that.
 *
 * @summary A short text shown on hover or focus of its trigger.
 * @tag lu-tooltip
 * @slot - The trigger, a single focusable element.
 * @csspart tooltip - The floating panel that holds the text.
 * @fires {CustomEvent<OpenChangeDetail>} lu-open-change - The user asked to show or hide the tooltip. `detail.open` is the state asked for; `detail.source` is `trigger` (the pointer or the focus reached or left the trigger, after the delay to show) or `escape`. Cancelable: `preventDefault()` keeps the tooltip as it is, and the element still holds `open` while the event runs.
 */
export class LumenTooltip extends LitElement {
  static properties = {
    content: {},
    delay: { type: Number },
    placement: {},
    open: { type: Boolean, reflect: true },
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

  /** The text of the tooltip. Line breaks are kept. An empty text shows nothing. */
  declare content: string
  /** How long the pointer or the focus must stay on the trigger before the tooltip shows, in milliseconds. */
  declare delay: number
  /** Where the tooltip sits against its trigger, as a Floating UI placement: `top`, `bottom-start`… It flips when there is no room. */
  declare placement: Placement
  /** Whether the tooltip is shown. The tooltip sets it on hover and focus of its trigger, unless `lu-open-change` is cancelled. */
  declare open: boolean
  private timer?: ReturnType<typeof setTimeout>
  private stopFloating?: () => void

  constructor() {
    super()
    this.content = ''
    this.delay = 200
    this.placement = 'top'
    this.open = false
    this.addEventListener('pointerenter', () => this.schedule())
    this.addEventListener('pointerleave', () => this.request(false, 'trigger'))
    this.addEventListener('focusin', () => this.schedule())
    this.addEventListener('focusout', () => this.request(false, 'trigger'))
    this.addEventListener('keydown', (event) => event.key === 'Escape' && this.request(false, 'escape'))
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
    if (changed.has('open') || changed.has('content')) {
      this.sync()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this.timer)
    this.hide()
  }

  private describeTrigger() {
    this.trigger?.setAttribute('aria-description', this.content)
  }

  private schedule() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.request(true, 'trigger'), this.delay)
  }

  private request(open: boolean, source: OpenChangeSource) {
    clearTimeout(this.timer)
    if (open === this.open || (open && !this.content)) {
      return
    }
    if (emit<OpenChangeDetail>(this, 'lu-open-change', { open, source }, { cancelable: true })) {
      this.open = open
    }
  }

  private sync() {
    if (this.open) {
      this.show()
    } else {
      this.hide()
    }
  }

  private show() {
    const trigger = this.trigger
    const panel = this.panel
    if (!trigger || !panel || !this.content || isPopoverOpen(panel)) {
      return
    }
    panel.showPopover()
    this.stopFloating = float(trigger, panel, { placement: this.placement, gap: 6 })
  }

  private hide() {
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
