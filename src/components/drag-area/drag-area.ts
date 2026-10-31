import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { css, html, LitElement } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import { MessagesController } from '../../lib/messages'
import { dragKey, type LumenDraggable } from './draggable'
import { LumenDropZone, zoneKey } from './drop-zone'
import { utilityStyles } from '../../lib/styles'

export interface DragEndDetail {
  active: string
  over: string | null
}

interface Carried {
  draggable: LumenDraggable
  zones: LumenDropZone[]
  index: number
}

/**
 * Moves `lu-draggable` items between `lu-drop-zone` targets, with the mouse, touch or the keyboard: Space picks an item up, the arrow keys move it across the zones, Space or Enter drops it and Escape cancels. Each step is announced.
 *
 * The area never moves the items itself: it fires `lu-drag-end` and the owner updates its data.
 *
 * The announcements are the `dragPickedUp`, `dragOver`, `dragDropped`, `dragDroppedOutside` and `dragCancelled` messages registered with `registerLumenMessages()`.
 *
 * @summary The scope of a drag and drop between zones.
 * @tag lu-drag-area
 * @slot - The drop zones and their draggable items.
 * @fires {CustomEvent<DragEndDetail>} lu-drag-end - An item was dropped. `detail.active` is its `drag-id`; `detail.over` is the `zone-id` it was dropped on, or `null` outside any zone. Not cancelable: the area never moves the item, the owner does.
 */
export class LumenDragArea extends LitElement {
  static properties = {
    announcement: { state: true },
  }

  static styles = [
    utilityStyles,
    css`
      :host {
        display: block;
      }
    `,
  ]

  declare private announcement: string
  private carried: Carried | null = null
  private cleanup?: () => void
  private messages = new MessagesController(this)

  constructor() {
    super()
    this.announcement = ''
    this.addEventListener('keydown', (event) => this.onKeydown(event))
  }

  connectedCallback() {
    super.connectedCallback()
    this.cleanup = monitorForElements({
      canMonitor: ({ source }) => this.contains(source.element),
      onDrop: ({ source, location }) => {
        const active = String(source.data[dragKey] ?? '')
        const zone = location.current.dropTargets.find((target) => zoneKey in target.data)
        this.end({ active, over: zone ? String(zone.data[zoneKey]) : null })
      },
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanup?.()
  }

  private get zones(): LumenDropZone[] {
    return [...this.querySelectorAll('lu-drop-zone')]
  }

  private end(detail: DragEndDetail) {
    emit<DragEndDetail>(this, 'lu-drag-end', detail)
  }

  private describe(zone: LumenDropZone | undefined): string {
    return zone?.label || zone?.zoneId || ''
  }

  /** @internal Called by lu-draggable, not by the application; the tag keeps it out of custom-elements.json. */
  pickUp(draggable: LumenDraggable) {
    const zones = this.zones
    const index = zones.findIndex((zone) => zone.contains(draggable))
    this.carried = { draggable, zones, index }
    draggable.dragging = true
    this.highlight(index)
    this.announcement = this.messages.format('dragPickedUp', { item: draggable.label || draggable.dragId })
  }

  private highlight(index: number) {
    this.carried?.zones.forEach((zone, position) => (zone.over = position === index))
  }

  private release() {
    const carried = this.carried
    if (!carried) {
      return
    }
    carried.draggable.dragging = false
    carried.zones.forEach((zone) => (zone.over = false))
    this.carried = null
    carried.draggable.focus()
  }

  private onKeydown(event: KeyboardEvent) {
    const carried = this.carried
    if (!carried || event.defaultPrevented) {
      return
    }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step !== undefined) {
      event.preventDefault()
      const count = carried.zones.length
      carried.index = (((carried.index < 0 ? 0 : carried.index + step) % count) + count) % count
      this.highlight(carried.index)
      this.announcement = this.messages.format('dragOver', { zone: this.describe(carried.zones[carried.index]) })
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      const zone = carried.zones[carried.index]
      const active = carried.draggable.dragId
      this.release()
      this.announcement = zone ? this.messages.format('dragDropped', { zone: this.describe(zone) }) : (this.messages.text('dragDroppedOutside') ?? '')
      this.end({ active, over: zone?.zoneId ?? null })
      carried.draggable.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      this.release()
      this.announcement = this.messages.text('dragCancelled') ?? ''
    }
  }

  render() {
    return html`<slot></slot>
      <div class="lu-visually-hidden" aria-live="assertive" aria-atomic="true">${this.announcement}</div>`
  }
}

define('lu-drag-area', LumenDragArea)

declare global {
  interface HTMLElementTagNameMap {
    'lu-drag-area': LumenDragArea
  }
}
