import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { css, html, LitElement } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import { MessagesController } from '../../lib/messages'

export const dragKey = 'luDragId'

/**
 * An item that moves inside a `lu-drag-area`. It is a focusable button: Space picks it up.
 *
 * When `openable`, a click or Enter fires `lu-open`, so the same card can be dragged and opened.
 *
 * Assistive technology calls it by `role-description`, or else by the `draggable` message registered with `registerLumenMessages()`.
 *
 * @summary An item that can be dragged between drop zones.
 * @tag lu-draggable
 * @slot - The content of the item.
 * @fires {CustomEvent<Record<string, never>>} lu-open - The user clicked the item or pressed Enter on it, while `openable` and not dragging. Not cancelable: the owner opens the item.
 */
export class LumenDraggable extends LitElement {
  static properties = {
    dragId: { attribute: 'drag-id', reflect: true },
    label: {},
    roleDescription: { attribute: 'role-description' },
    openable: { type: Boolean, reflect: true },
    dragging: { type: Boolean, reflect: true },
  }

  static styles = css`
    :host {
      display: block;
      border-radius: var(--lu-radius-md);
      cursor: grab;
      touch-action: none;
    }

    :host([openable]) {
      cursor: pointer;
    }

    :host([openable]:hover) {
      box-shadow: 0 0 0 1px color-mix(in oklab, var(--lu-color-primary) 40%, transparent);
    }

    :host(:active) {
      cursor: grabbing;
    }

    :host([dragging]) {
      opacity: 0.4;
    }

    :host(:focus-visible) {
      outline: 2px solid var(--lu-color-ring);
      outline-offset: 2px;
    }
  `

  /** The identifier of the item, sent as `detail.active` of `lu-drag-end`. */
  declare dragId: string
  /** The accessible name of the item and its name in the announcements. Without it, the item is named by its content and announced by its `drag-id`. */
  declare label: string
  /** What assistive technology calls the item instead of « button ». Overrides the `draggable` message registered with `registerLumenMessages()`. */
  declare roleDescription: string
  /** Whether a click or Enter opens the item and fires `lu-open`. */
  declare openable: boolean
  /** Whether the item is being dragged. The drag area sets it. */
  declare dragging: boolean
  private cleanup?: () => void
  private messages = new MessagesController(this)

  constructor() {
    super()
    this.dragId = ''
    this.label = ''
    this.roleDescription = ''
    this.openable = false
    this.dragging = false
    this.addEventListener('click', () => this.openable && !this.dragging && emit(this, 'lu-open', {}))
    this.addEventListener('keydown', (event) => this.onKeydown(event))
  }

  connectedCallback() {
    super.connectedCallback()
    this.tabIndex = 0
    this.setAttribute('role', 'button')
    this.cleanup = draggable({
      element: this,
      getInitialData: () => ({ [dragKey]: this.dragId }),
      onDragStart: () => (this.dragging = true),
      onDrop: () => (this.dragging = false),
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanup?.()
  }

  updated() {
    this.reflect('aria-label', this.label)
    this.reflect('aria-roledescription', this.messages.text('draggable', this.roleDescription, 'role-description'))
  }

  private reflect(name: string, value: string | undefined) {
    if (value) {
      this.setAttribute(name, value)
    } else {
      this.removeAttribute(name)
    }
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.target !== this || this.dragging) {
      return
    }
    if (event.key === ' ') {
      event.preventDefault()
      this.closest('lu-drag-area')?.pickUp(this)
    } else if (event.key === 'Enter' && this.openable) {
      event.preventDefault()
      emit(this, 'lu-open', {})
    }
  }

  render() {
    return html`<slot></slot>`
  }
}

define('lu-draggable', LumenDraggable)

declare global {
  interface HTMLElementTagNameMap {
    'lu-draggable': LumenDraggable
  }
}
