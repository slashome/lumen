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
 * Shows a card of rich, interactive content next to its trigger on hover and focus, after a delay, in the top layer. The card stays open while the pointer or the focus is on it.
 *
 * The trigger is the element whose id is in `for`, looked up in the document or shadow root that holds the card, as `<label for>` does; or the element given to the `anchor` property, when it lives elsewhere. The card follows a trigger that appears, or gets its id, later. It sets `aria-expanded` and `aria-controls` on its trigger, and removes them when it is unbound. Place the card right after its trigger, so that Tab moves from the trigger into the card.
 *
 * The card opens and closes itself: it fires a cancelable `lu-open-change`, then sets `open` unless a listener called `preventDefault()`. To control it, cancel the event and set `open` yourself. `pinned` shows the card whatever `open` says.
 *
 * @summary A card of rich content shown on hover or focus of its trigger.
 * @tag lu-hover-card
 * @slot - The content of the card.
 * @cssprop --lu-hover-card-width - The inline size of the card, capped by the viewport. Defaults to 24rem.
 * @fires {CustomEvent<OpenChangeDetail>} lu-open-change - The user asked to open or close the card. `detail.open` is the state asked for; `detail.source` is `trigger` (the pointer or the focus reached or left the trigger, after the delay), `panel` (the pointer or the focus reached or left the card) or `escape`. Never fired while `pinned`. Cancelable: `preventDefault()` keeps the card as it is, and the element still holds `open` while the event runs.
 */
export class LumenHoverCard extends LitElement {
  static properties = {
    htmlFor: { attribute: 'for' },
    anchor: { attribute: false },
    openDelay: { type: Number, attribute: 'open-delay' },
    closeDelay: { type: Number, attribute: 'close-delay' },
    placement: {},
    pinned: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
  }

  static styles = css`
    :host {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      inline-size: var(--lu-hover-card-width, 24rem);
      max-inline-size: calc(100vw - 1rem);
      margin: 0;
      padding: var(--lu-space-3);
      overflow: visible;
      border: 1px solid var(--lu-color-border);
      border-radius: var(--lu-radius-lg);
      background: var(--lu-color-popover);
      color: var(--lu-color-foreground);
      font-family: var(--lu-font-family-sans);
      font-size: var(--lu-font-size-sm);
      box-shadow: var(--lu-shadow-lg);
    }
  `

  /** The id of the trigger, in the document or shadow root that holds the card. */
  declare htmlFor: string
  /** The trigger itself, when it is not in the document or shadow root that holds the card. Wins over `for`. */
  declare anchor: Element | null
  /** How long the pointer or the focus must stay on the trigger before the card opens, in milliseconds. */
  declare openDelay: number
  /** How long the card stays open after the pointer or the focus leaves, in milliseconds. */
  declare closeDelay: number
  /** Where the card sits against its trigger, as a Floating UI placement: `bottom-end`, `top`… It flips when there is no room. */
  declare placement: Placement
  /** Whether the card stays open regardless of hover, focus and `open`, and ignores Escape. Once cleared, the card follows `open` again after `close-delay`. */
  declare pinned: boolean
  /** Whether the card is open. The card sets it on hover and focus, unless `lu-open-change` is cancelled. */
  declare open: boolean
  private timer?: ReturnType<typeof setTimeout>
  private stopFloating?: () => void
  private triggers = new TriggerController(this, (trigger) => this.bindTrigger(trigger))

  constructor() {
    super()
    this.htmlFor = ''
    this.anchor = null
    this.openDelay = 700
    this.closeDelay = 300
    this.placement = 'bottom-end'
    this.pinned = false
    this.open = false
    this.addEventListener('pointerenter', () => this.onPanelEnter())
    this.addEventListener('pointerleave', () => this.schedule(false, 'panel'))
    this.addEventListener('focusin', () => this.onPanelEnter())
    this.addEventListener('focusout', () => this.schedule(false, 'panel'))
    this.addEventListener('keydown', (event) => this.onKeydown(event))
  }

  connectedCallback() {
    ensureId(this, 'lu-hover-card')
    this.setAttribute('popover', 'manual')
    super.connectedCallback()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this.timer)
    this.hide()
  }

  protected updated(changed: PropertyValues<this>) {
    if (!changed.has('open') && !changed.has('pinned')) {
      return
    }
    clearTimeout(this.timer)
    if (this.open || this.pinned) {
      this.show()
    } else if (changed.get('pinned') === true) {
      this.timer = setTimeout(() => this.sync(), this.closeDelay)
    } else {
      this.hide()
    }
  }

  private bindTrigger(trigger: Element): () => void {
    const enter = () => this.schedule(true, 'trigger')
    const leave = () => this.schedule(false, 'trigger')
    const keydown = (event: Event) => this.onKeydown(event as KeyboardEvent)
    const listeners: [string, EventListener][] = [
      ['pointerenter', enter],
      ['pointerleave', leave],
      ['focusin', enter],
      ['focusout', leave],
      ['keydown', keydown],
    ]
    listeners.forEach(([name, listener]) => trigger.addEventListener(name, listener))
    const unrefer = referTo(trigger, 'aria-controls', this)
    this.hide()
    this.sync()
    return () => {
      clearTimeout(this.timer)
      this.hide()
      listeners.forEach(([name, listener]) => trigger.removeEventListener(name, listener))
      unrefer()
      trigger.removeAttribute('aria-expanded')
    }
  }

  private sync() {
    if (this.open || this.pinned) {
      this.show()
    } else {
      this.hide()
    }
  }

  private schedule(open: boolean, source: OpenChangeSource) {
    clearTimeout(this.timer)
    if (this.pinned) {
      return
    }
    this.timer = setTimeout(() => this.request(open, source), open ? this.openDelay : this.closeDelay)
  }

  private request(open: boolean, source: OpenChangeSource) {
    clearTimeout(this.timer)
    if (this.pinned || open === this.open) {
      this.sync()
      return
    }
    if (emit<OpenChangeDetail>(this, 'lu-open-change', { open, source }, { cancelable: true })) {
      this.open = open
    }
  }

  private show() {
    const trigger = this.triggers.trigger
    if (!trigger) {
      return
    }
    trigger.setAttribute('aria-expanded', 'true')
    if (isPopoverOpen(this)) {
      return
    }
    this.showPopover()
    this.stopFloating = float(trigger, this, { placement: this.placement, gap: 6 })
  }

  private hide() {
    this.triggers.trigger?.setAttribute('aria-expanded', 'false')
    this.stopFloating?.()
    this.stopFloating = undefined
    if (isPopoverOpen(this)) {
      this.hidePopover()
    }
  }

  private onPanelEnter() {
    if (!this.pinned) {
      this.request(true, 'panel')
    }
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !this.pinned) {
      this.request(false, 'escape')
    }
  }

  render() {
    return html`<slot></slot>`
  }
}

define('lu-hover-card', LumenHoverCard)

declare global {
  interface HTMLElementTagNameMap {
    'lu-hover-card': LumenHoverCard
  }
}
