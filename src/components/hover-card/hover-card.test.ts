import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '../../testing/mount'
import type { OpenChangeDetail } from '../../lib/change'
import { isPopoverOpen } from '../../lib/popover'
import type { LumenHoverCard } from './hover-card'
import './hover-card'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

const markup = '<lu-hover-card open-delay="100" close-delay="50"><button slot="trigger">3 changes</button><p>Commit or push.</p></lu-hover-card>'

function card(hoverCard: LumenHoverCard): HTMLElement {
  return hoverCard.shadowRoot!.querySelector('[part="card"]')!
}

function triggerSlot(hoverCard: LumenHoverCard): HTMLSlotElement {
  return hoverCard.shadowRoot!.querySelector('slot[name="trigger"]')!
}

function pressEscape(target: Element) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
}

async function setUp() {
  const hoverCard = await mount<LumenHoverCard>(markup)
  const changes: OpenChangeDetail[] = []
  hoverCard.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<OpenChangeDetail>).detail))
  return { hoverCard, changes }
}

async function settle(hoverCard: LumenHoverCard, milliseconds: number) {
  vi.advanceTimersByTime(milliseconds)
  await hoverCard.updateComplete
}

describe('lu-hover-card', () => {
  it('opens itself after its delay on the trigger, and closes itself after its delay once left', async () => {
    const { hoverCard, changes } = await setUp()
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 99)
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
    await settle(hoverCard, 1)
    expect(hoverCard.open).toBe(true)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 49)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    await settle(hoverCard, 1)
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
    expect(changes).toEqual([
      { open: true, source: 'trigger' },
      { open: false, source: 'trigger' },
    ])
  })

  it('stays open while the pointer is on the card, and closes once it leaves the card', async () => {
    const { hoverCard, changes } = await setUp()
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 100)
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerleave'))
    card(hoverCard).dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 500)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    card(hoverCard).dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 50)
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
    expect(changes.map((change) => change.source)).toEqual(['trigger', 'panel'])
  })

  it('closes itself on Escape', async () => {
    const { hoverCard, changes } = await setUp()
    triggerSlot(hoverCard).dispatchEvent(new Event('focusin'))
    await settle(hoverCard, 100)
    pressEscape(triggerSlot(hoverCard))
    await hoverCard.updateComplete
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
    expect(changes.at(-1)).toEqual({ open: false, source: 'escape' })
  })

  it('is controlled by cancelling lu-open-change and setting open', async () => {
    const { hoverCard } = await setUp()
    hoverCard.addEventListener('lu-open-change', (event) => event.preventDefault())
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 100)
    expect(isPopoverOpen(card(hoverCard))).toBe(false)

    hoverCard.open = true
    await hoverCard.updateComplete
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    pressEscape(card(hoverCard))
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 500)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)

    hoverCard.open = false
    await hoverCard.updateComplete
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
  })

  it('stays open while pinned, ignoring Escape, and follows open again after its delay once unpinned', async () => {
    const { hoverCard, changes } = await setUp()
    hoverCard.pinned = true
    await hoverCard.updateComplete
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    pressEscape(triggerSlot(hoverCard))
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 500)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    expect(changes).toEqual([])

    hoverCard.pinned = false
    await hoverCard.updateComplete
    await settle(hoverCard, 49)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    await settle(hoverCard, 1)
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
  })
})
