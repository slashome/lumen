import type { Placement } from '@floating-ui/dom'
import { css, html, LitElement, type PropertyValues } from 'lit'
import type { OpenChangeDetail, OpenChangeSource } from '../../lib/change'
import { emit } from '../../lib/emit'
import { float } from '../../lib/floating'
import { isPopoverOpen } from '../../lib/popover'
import { define } from '../../lib/define'
import { ensureId, referTo, TriggerController } from '../../lib/trigger'

export type { OpenChangeDetail } from '../../lib/change'

/**
 * Shows a short text next to its trigger on hover and focus, after a delay, in the top layer. The trigger is the element whose id is in `for`, looked up in the document or shadow root that holds the tooltip, as `<label for>` does; or the element given to the `anchor` property, when it lives elsewhere. The tooltip follows a trigger that appears, or gets its id, later.
 *
 * The tooltip is the popover itself, with `role="tooltip"`. It sets `aria-describedby` on its trigger, so that its text describes the trigger for assistive technology, and removes it when it is unbound.
 *
 * The tooltip opens and closes itself: it fires a cancelable `lu-open-change`, then sets `open` unless a listener called `preventDefault()`. To control it, cancel the event and set `open` yourself.
 *
 * The tooltip never holds interactive content: use `lu-hover-card` for that.
 *
 * @summary A short text shown on hover or focus of its trigger.
 * @tag lu-tooltip
 * @slot - The text of the tooltip. Line breaks are kept. Without content, the tooltip shows nothing.
 * @fires {CustomEvent<OpenChangeDetail>} lu-open-change - The user asked to show or hide the tooltip. `detail.open` is the state asked for; `detail.source` is `trigger` (the pointer or the focus reached or left the trigger, after the delay to show) or `escape`. Cancelable: `preventDefault()` keeps the tooltip as it is, and the element still holds `open` while the event runs.
 */
export class LumenTooltip extends LitElement {
  static properties = {
    htmlFor: { attribute: 'for' },
    anchor: { attribute: false },
    delay: { type: Number },
    placement: {},
    open: { type: Boolean, reflect: true },
  }

  static styles = css`
    :host {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      max-inline-size: 28rem;
      margin: 0;
      padding: var(--lu-space-1) var(--lu-space-2);
      overflow: visible;
      border: 1px solid var(--lu-color-border);
      border-radius: var(--lu-radius-md);
      background: var(--lu-color-popover);
      color: var(--lu-color-foreground);
      font-family: var(--lu-font-family-mono);
      font-size: var(--lu-font-size-xs);
      white-space: pre-line;
      box-shadow: var(--lu-shadow-md);
      pointer-events: none;
    }
  `

  /** The id of the trigger, in the document or shadow root that holds the tooltip. */
  declare htmlFor: string
  /** The trigger itself, when it is not in the document or shadow root that holds the tooltip. Wins over `for`. */
  declare anchor: Element | null
  /** How long the pointer or the focus must stay on the trigger before the tooltip shows, in milliseconds. */
  declare delay: number
  /** Where the tooltip sits against its trigger, as a Floating UI placement: `top`, `bottom-start`… It flips when there is no room. */
  declare placement: Placement
  /** Whether the tooltip is shown. The tooltip sets it on hover and focus of its trigger, unless `lu-open-change` is cancelled. */
  declare open: boolean
  private timer?: ReturnType<typeof setTimeout>
  private stopFloating?: () => void
  private triggers = new TriggerController(this, (trigger) => this.bindTrigger(trigger))

  constructor() {
    super()
    this.htmlFor = ''
    this.anchor = null
    this.delay = 200
    this.placement = 'top'
    this.open = false
  }

  connectedCallback() {
    ensureId(this, 'lu-tooltip')
    this.setAttribute('popover', 'manual')
    this.setAttribute('role', 'tooltip')
    super.connectedCallback()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this.timer)
    this.hide()
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      this.sync()
    }
  }

  private get hasContent(): boolean {
    return [...this.childNodes].some((node) => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim()))
  }

  private bindTrigger(trigger: Element): () => void {
    const enter = () => this.schedule()
    const leave = () => this.request(false, 'trigger')
    const escape = (event: Event) => {
      if ((event as KeyboardEvent).key === 'Escape') {
        this.request(false, 'escape')
      }
    }
    const listeners: [string, EventListener][] = [
      ['pointerenter', enter],
      ['pointerleave', leave],
      ['focusin', enter],
      ['focusout', leave],
      ['keydown', escape],
    ]
    listeners.forEach(([name, listener]) => trigger.addEventListener(name, listener))
    const unrefer = referTo(trigger, 'aria-describedby', this)
    this.hide()
    this.sync()
    return () => {
      listeners.forEach(([name, listener]) => trigger.removeEventListener(name, listener))
      unrefer()
      clearTimeout(this.timer)
      this.hide()
    }
  }

  private schedule() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.request(true, 'trigger'), this.delay)
  }

  private request(open: boolean, source: OpenChangeSource) {
    clearTimeout(this.timer)
    if (open === this.open || (open && !this.hasContent)) {
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
    const trigger = this.triggers.trigger
    if (!trigger || !this.hasContent || isPopoverOpen(this)) {
      return
    }
    this.showPopover()
    this.stopFloating = float(trigger, this, { placement: this.placement, gap: 6 })
  }

  private hide() {
    this.stopFloating?.()
    this.stopFloating = undefined
    if (isPopoverOpen(this)) {
      this.hidePopover()
    }
  }

  render() {
    return html`<slot></slot>`
  }
}

define('lu-tooltip', LumenTooltip)

declare global {
  interface HTMLElementTagNameMap {
    'lu-tooltip': LumenTooltip
  }
}
