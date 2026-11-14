import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const markup = '<button id="changes">3 changes</button><lu-hover-card for="changes" open-delay="100" close-delay="50"><p>Commit or push.</p></lu-hover-card>'

function pressEscape(target: Element) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
}

async function setUp(html = markup) {
  document.body.innerHTML = html
  const hoverCard = document.querySelector<LumenHoverCard>('lu-hover-card')!
  await hoverCard.updateComplete
  const trigger = document.querySelector('button')!
  const changes: OpenChangeDetail[] = []
  hoverCard.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<OpenChangeDetail>).detail))
  return { hoverCard, trigger, changes }
}

async function settle(hoverCard: LumenHoverCard, milliseconds: number) {
  vi.advanceTimersByTime(milliseconds)
  await hoverCard.updateComplete
}

describe('lu-hover-card', () => {
  it('is the popover itself, and tells its trigger whether it is expanded and what it controls', async () => {
    const { hoverCard, trigger } = await setUp()
    expect(hoverCard.getAttribute('popover')).toBe('manual')
    expect(trigger.getAttribute('aria-controls')).toBe(hoverCard.id)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    hoverCard.open = true
    await hoverCard.updateComplete
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    hoverCard.remove()
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
    expect(trigger.hasAttribute('aria-expanded')).toBe(false)
  })

  it('opens itself after its delay on the trigger, and closes itself after its delay once left', async () => {
    const { hoverCard, trigger, changes } = await setUp()
    trigger.dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 99)
    expect(isPopoverOpen(hoverCard)).toBe(false)
    await settle(hoverCard, 1)
    expect(hoverCard.open).toBe(true)
    expect(isPopoverOpen(hoverCard)).toBe(true)
    trigger.dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 49)
    expect(isPopoverOpen(hoverCard)).toBe(true)
    await settle(hoverCard, 1)
    expect(isPopoverOpen(hoverCard)).toBe(false)
    expect(changes).toEqual([
      { open: true, source: 'trigger' },
      { open: false, source: 'trigger' },
    ])
  })

  it('stays open while the pointer is on the card, and closes once it leaves the card', async () => {
    const { hoverCard, trigger, changes } = await setUp()
    trigger.dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 100)
    trigger.dispatchEvent(new Event('pointerleave'))
    hoverCard.dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 500)
    expect(isPopoverOpen(hoverCard)).toBe(true)
    hoverCard.dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 50)
    expect(isPopoverOpen(hoverCard)).toBe(false)
    expect(changes.map((change) => change.source)).toEqual(['trigger', 'panel'])
  })

  it('closes itself on Escape', async () => {
    const { hoverCard, trigger, changes } = await setUp()
    trigger.dispatchEvent(new Event('focusin'))
    await settle(hoverCard, 100)
    pressEscape(trigger)
    await hoverCard.updateComplete
    expect(isPopoverOpen(hoverCard)).toBe(false)
    expect(changes.at(-1)).toEqual({ open: false, source: 'escape' })
  })

  it('is controlled by cancelling lu-open-change and setting open', async () => {
    const { hoverCard, trigger } = await setUp()
    hoverCard.addEventListener('lu-open-change', (event) => event.preventDefault())
    trigger.dispatchEvent(new Event('pointerenter'))
    await settle(hoverCard, 100)
    expect(isPopoverOpen(hoverCard)).toBe(false)

    hoverCard.open = true
    await hoverCard.updateComplete
    expect(isPopoverOpen(hoverCard)).toBe(true)
    pressEscape(hoverCard)
    trigger.dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 500)
    expect(isPopoverOpen(hoverCard)).toBe(true)

    hoverCard.open = false
    await hoverCard.updateComplete
    expect(isPopoverOpen(hoverCard)).toBe(false)
  })

  it('stays open while pinned, ignoring Escape, and follows open again after its delay once unpinned', async () => {
    const { hoverCard, trigger, changes } = await setUp()
    hoverCard.pinned = true
    await hoverCard.updateComplete
    expect(isPopoverOpen(hoverCard)).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    pressEscape(trigger)
    trigger.dispatchEvent(new Event('pointerleave'))
    await settle(hoverCard, 500)
    expect(isPopoverOpen(hoverCard)).toBe(true)
    expect(changes).toEqual([])

    hoverCard.pinned = false
    await hoverCard.updateComplete
    await settle(hoverCard, 49)
    expect(isPopoverOpen(hoverCard)).toBe(true)
    await settle(hoverCard, 1)
    expect(isPopoverOpen(hoverCard)).toBe(false)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('binds a trigger that gets its id after the card, and moves to the anchor property when it is set', async () => {
    const { hoverCard, trigger } = await setUp('<button>3 changes</button><button>Branch</button><lu-hover-card for="changes"><p>Commit</p></lu-hover-card>')
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
    trigger.id = 'changes'
    await Promise.resolve()
    await Promise.resolve()
    expect(trigger.getAttribute('aria-controls')).toBe(hoverCard.id)

    const branch = document.querySelectorAll('button')[1]!
    hoverCard.anchor = branch
    await hoverCard.updateComplete
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
    expect(trigger.hasAttribute('aria-expanded')).toBe(false)
    expect(branch.getAttribute('aria-controls')).toBe(hoverCard.id)
  })
})
