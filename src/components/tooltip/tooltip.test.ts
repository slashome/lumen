import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '../../testing/mount'
import type { OpenChangeDetail } from '../../lib/change'
import { isPopoverOpen } from '../../lib/popover'
import type { LumenTooltip } from './tooltip'
import './tooltip'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

function panel(tooltip: LumenTooltip): HTMLElement {
  return tooltip.shadowRoot!.querySelector('[role="tooltip"]')!
}

function trigger(tooltip: LumenTooltip): HTMLButtonElement {
  return tooltip.querySelector('button')!
}

function pressEscape(tooltip: LumenTooltip) {
  trigger(tooltip).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }))
}

async function setUp(markup = '<lu-tooltip content="Copy the command" delay="100"><button>Copy</button></lu-tooltip>') {
  const tooltip = await mount<LumenTooltip>(markup)
  const changes: OpenChangeDetail[] = []
  tooltip.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<OpenChangeDetail>).detail))
  return { tooltip, changes }
}

describe('lu-tooltip', () => {
  it('describes its trigger with its content', async () => {
    const { tooltip } = await setUp()
    expect(trigger(tooltip).getAttribute('aria-description')).toBe('Copy the command')
  })

  it('opens itself after its delay once the trigger has the focus, and closes on Escape', async () => {
    const { tooltip, changes } = await setUp()
    trigger(tooltip).dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
    vi.advanceTimersByTime(99)
    expect(changes).toEqual([])
    vi.advanceTimersByTime(1)
    await tooltip.updateComplete
    expect(tooltip.open).toBe(true)
    expect(isPopoverOpen(panel(tooltip))).toBe(true)
    pressEscape(tooltip)
    await tooltip.updateComplete
    expect(tooltip.open).toBe(false)
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
    expect(changes).toEqual([
      { open: true, source: 'trigger' },
      { open: false, source: 'escape' },
    ])
  })

  it('closes itself when the pointer leaves the trigger', async () => {
    const { tooltip, changes } = await setUp()
    tooltip.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    tooltip.dispatchEvent(new Event('pointerleave'))
    await tooltip.updateComplete
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
    expect(changes).toEqual([
      { open: true, source: 'trigger' },
      { open: false, source: 'trigger' },
    ])
  })

  it('still holds open while lu-open-change runs', async () => {
    const { tooltip } = await setUp()
    const seen: boolean[] = []
    tooltip.addEventListener('lu-open-change', () => seen.push(tooltip.open))
    tooltip.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    expect(seen).toEqual([false])
  })

  it('is controlled by cancelling lu-open-change and setting open', async () => {
    const { tooltip } = await setUp()
    tooltip.addEventListener('lu-open-change', (event) => event.preventDefault())
    tooltip.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    await tooltip.updateComplete
    expect(isPopoverOpen(panel(tooltip))).toBe(false)

    tooltip.open = true
    await tooltip.updateComplete
    expect(isPopoverOpen(panel(tooltip))).toBe(true)
    pressEscape(tooltip)
    tooltip.dispatchEvent(new Event('pointerleave'))
    await tooltip.updateComplete
    expect(isPopoverOpen(panel(tooltip))).toBe(true)

    tooltip.open = false
    await tooltip.updateComplete
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
  })

  it('shows nothing and fires nothing without content', async () => {
    const { tooltip, changes } = await setUp('<lu-tooltip><button>Copy</button></lu-tooltip>')
    tooltip.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    await tooltip.updateComplete
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
    expect(changes).toEqual([])
  })
})
