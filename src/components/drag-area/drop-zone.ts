import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { define } from '../../lib/define'

export const zoneKey = 'luZoneId'

/**
 * A target of a `lu-drag-area`. With a `label` it is a named region.
 *
 * @summary A zone where draggable items can be dropped.
 * @tag lu-drop-zone
 * @slot - The content of the zone, usually its draggable items.
 */
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

  /** The identifier of the zone, sent as `detail.over` of `lu-drag-end`. */
  declare zoneId: string
  /** The accessible name of the zone and its name in the announcements. Without it, the zone is not a region and is announced by its `zone-id`. */
  declare label: string
  /** Whether an item is over the zone. The drag area sets it. */
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
