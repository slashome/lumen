import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { DragEndDetail, LumenDragArea } from './drag-area'
import type { LumenDraggable } from './draggable'
import type { LumenDropZone } from './drop-zone'
import './drag-area'

afterEach(() => {
  document.body.innerHTML = ''
})

const markup = `<lu-drag-area>
  <lu-drop-zone zone-id="todo" label="To do"><lu-draggable drag-id="T104" label="T104">T104</lu-draggable></lu-drop-zone>
  <lu-drop-zone zone-id="done" label="Done"></lu-drop-zone>
</lu-drag-area>`

function press(target: Element, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))
}

async function setUp() {
  const area = await mount<LumenDragArea>(markup)
  const item = area.querySelector<LumenDraggable>('lu-draggable')!
  const zones = [...area.querySelectorAll<LumenDropZone>('lu-drop-zone')]
  const drops: DragEndDetail[] = []
  area.addEventListener('lu-drag-end', (event) => drops.push((event as CustomEvent<DragEndDetail>).detail))
  return { area, item, zones, drops }
}

function announcement(area: LumenDragArea): string {
  return area.shadowRoot!.querySelector('[aria-live]')?.textContent ?? ''
}

describe('lu-drag-area', () => {
  it('moves an item with the keyboard and fires lu-drag-end with its zone', async () => {
    const { area, item, zones, drops } = await setUp()
    press(item, ' ')
    expect(item.dragging).toBe(true)
    expect(zones.map((zone) => zone.over)).toEqual([true, false])
    await area.updateComplete
    expect(announcement(area)).toContain('Picked up T104')

    press(item, 'ArrowRight')
    expect(zones.map((zone) => zone.over)).toEqual([false, true])
    await area.updateComplete
    expect(announcement(area)).toBe('Over Done.')

    press(item, ' ')
    expect(drops).toEqual([{ active: 'T104', over: 'done' }])
    expect(item.dragging).toBe(false)
    expect(zones.map((zone) => zone.over)).toEqual([false, false])
  })

  it('cancels a keyboard move on Escape without firing lu-drag-end', async () => {
    const { area, item, zones, drops } = await setUp()
    press(item, ' ')
    press(item, 'ArrowRight')
    press(item, 'Escape')
    expect(drops).toEqual([])
    expect(item.dragging).toBe(false)
    expect(zones.map((zone) => zone.over)).toEqual([false, false])
    await area.updateComplete
    expect(announcement(area)).toBe('Move cancelled.')
  })
})
