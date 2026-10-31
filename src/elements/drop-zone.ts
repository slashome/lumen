import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { define } from './define'

export const zoneKey = 'luZoneId'

export class LumenDropZone extends LitElement {
  static properties = {
    zoneId: { attribute: 'zone-id', reflect: true },
    label: {},
    over: { type: Boolean, reflect: true },
  }

  static styles = css`
    :host {
      display: block;
    }

    :host([over]) {
      outline: 2px solid color-mix(in oklab, var(--lu-color-primary) 60%, transparent);
      outline-offset: -2px;
    }
  `

  declare zoneId: string
  declare label: string
  declare over: boolean
  private cleanup?: () => void

  constructor() {
    super()
    this.zoneId = ''
    this.label = ''
    this.over = false
  }

  connectedCallback() {
    super.connectedCallback()
    this.cleanup = dropTargetForElements({
      element: this,
      getData: () => ({ [zoneKey]: this.zoneId }),
      onDragEnter: () => (this.over = true),
      onDragLeave: () => (this.over = false),
      onDrop: () => (this.over = false),
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanup?.()
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('label')) {
      if (this.label) {
        this.setAttribute('role', 'region')
        this.setAttribute('aria-label', this.label)
      } else {
        this.removeAttribute('role')
        this.removeAttribute('aria-label')
      }
    }
  }

  render() {
    return html`<slot></slot>`
  }
}

define('lu-drop-zone', LumenDropZone)

declare global {
  interface HTMLElementTagNameMap {
    'lu-drop-zone': LumenDropZone
  }
}
