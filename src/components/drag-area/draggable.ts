import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { css, html, LitElement } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'

export const dragKey = 'luDragId'

export interface PickupDetail {
  id: string
}

export class LumenDraggable extends LitElement {
  static properties = {
    dragId: { attribute: 'drag-id', reflect: true },
    label: {},
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

  declare dragId: string
  declare label: string
  declare openable: boolean
  declare dragging: boolean
  private cleanup?: () => void

  constructor() {
    super()
    this.dragId = ''
    this.label = ''
    this.openable = false
    this.dragging = false
    this.addEventListener('click', () => this.openable && !this.dragging && emit(this, 'lu-open', {}))
    this.addEventListener('keydown', (event) => this.onKeydown(event))
  }

  connectedCallback() {
    super.connectedCallback()
    this.tabIndex = 0
    this.setAttribute('role', 'button')
    this.setAttribute('aria-roledescription', 'draggable')
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
    if (this.label) {
      this.setAttribute('aria-label', this.label)
    } else {
      this.removeAttribute('aria-label')
    }
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.target !== this || this.dragging) {
      return
    }
    if (event.key === ' ') {
      event.preventDefault()
      emit<PickupDetail>(this, 'lu-pickup', { id: this.dragId })
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
