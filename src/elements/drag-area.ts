import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { css, html, LitElement } from 'lit'
import { emit } from '../lib/emit'
import { define } from './define'
import { dragKey, LumenDraggable, type PickupDetail } from './draggable'
import { LumenDropZone, zoneKey } from './drop-zone'
import { visuallyHidden } from './styles'

export interface DragEndDetail {
  active: string
  over: string | null
}

interface Carried {
  draggable: LumenDraggable
  zones: LumenDropZone[]
  index: number
}

export class LumenDragArea extends LitElement {
  static properties = {
    announcement: { state: true },
  }

  static styles = [
    visuallyHidden,
    css`
      :host {
        display: block;
      }
    `,
  ]

  declare private announcement: string
  private carried: Carried | null = null
  private cleanup?: () => void

  constructor() {
    super()
    this.announcement = ''
    this.addEventListener('lumen-pickup', (event) => this.pickUp(event as CustomEvent<PickupDetail>))
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
    return [...this.querySelectorAll('lumen-drop-zone')]
  }

  private end(detail: DragEndDetail) {
    emit<DragEndDetail>(this, 'lumen-drag-end', detail)
  }

  private describe(zone: LumenDropZone | undefined): string {
    return zone?.label || zone?.zoneId || ''
  }

  private pickUp(event: CustomEvent<PickupDetail>) {
    const draggable = event.composedPath().find((node): node is LumenDraggable => node instanceof LumenDraggable)
    if (!draggable) {
      return
    }
    const zones = this.zones
    const index = zones.findIndex((zone) => zone.contains(draggable))
    this.carried = { draggable, zones, index }
    draggable.dragging = true
    this.highlight(index)
    this.announcement = `Picked up ${draggable.label || draggable.dragId}. Use the arrow keys to move, Space to drop, Escape to cancel.`
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
    if (!carried) {
      return
    }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step !== undefined) {
      event.preventDefault()
      const count = carried.zones.length
      carried.index = (((carried.index < 0 ? 0 : carried.index + step) % count) + count) % count
      this.highlight(carried.index)
      this.announcement = `Over ${this.describe(carried.zones[carried.index])}.`
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      const zone = carried.zones[carried.index]
      const active = carried.draggable.dragId
      this.release()
      this.announcement = zone ? `Dropped on ${this.describe(zone)}.` : 'Dropped.'
      this.end({ active, over: zone?.zoneId ?? null })
    } else if (event.key === 'Escape') {
      event.preventDefault()
      this.release()
      this.announcement = 'Move cancelled.'
    }
  }

  render() {
    return html`<slot></slot>
      <div class="visually-hidden" aria-live="assertive" aria-atomic="true">${this.announcement}</div>`
  }
}

define('lumen-drag-area', LumenDragArea)

declare global {
  interface HTMLElementTagNameMap {
    'lumen-drag-area': LumenDragArea
  }
}
