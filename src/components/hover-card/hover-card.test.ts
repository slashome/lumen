import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '../../testing/mount'
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

describe('lu-hover-card', () => {
  it('opens after its delay on the trigger, and closes after its delay once left', async () => {
    const hoverCard = await mount<LumenHoverCard>(markup)
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(99)
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
    vi.advanceTimersByTime(1)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(49)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    vi.advanceTimersByTime(1)
    expect(isPopoverOpen(card(hoverCard))).toBe(false)
  })

  it('stays open while the pointer is on the card', async () => {
    const hoverCard = await mount<LumenHoverCard>(markup)
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(100)
    triggerSlot(hoverCard).dispatchEvent(new Event('pointerleave'))
    card(hoverCard).dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(500)
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
  })

  it('closes on Escape, unless pinned', async () => {
    const hoverCard = await mount<LumenHoverCard>(markup)
    triggerSlot(hoverCard).dispatchEvent(new Event('focusin'))
    vi.advanceTimersByTime(100)
    triggerSlot(hoverCard).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(isPopoverOpen(card(hoverCard))).toBe(false)

    hoverCard.pinned = true
    await hoverCard.updateComplete
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
    triggerSlot(hoverCard).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(isPopoverOpen(card(hoverCard))).toBe(true)
  })
})
