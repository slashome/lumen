import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '../../testing/mount'
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

describe('lu-tooltip', () => {
  it('describes its trigger with its content', async () => {
    const tooltip = await mount<LumenTooltip>('<lu-tooltip content="Copy the command"><button>Copy</button></lu-tooltip>')
    expect(trigger(tooltip).getAttribute('aria-description')).toBe('Copy the command')
  })

  it('shows after its delay once the trigger has the focus, and hides on Escape', async () => {
    const tooltip = await mount<LumenTooltip>('<lu-tooltip content="Copy the command" delay="100"><button>Copy</button></lu-tooltip>')
    trigger(tooltip).dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
    vi.advanceTimersByTime(99)
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
    vi.advanceTimersByTime(1)
    expect(isPopoverOpen(panel(tooltip))).toBe(true)
    trigger(tooltip).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }))
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
  })

  it('hides when the pointer leaves the trigger', async () => {
    const tooltip = await mount<LumenTooltip>('<lu-tooltip content="Copy the command"><button>Copy</button></lu-tooltip>')
    tooltip.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    expect(isPopoverOpen(panel(tooltip))).toBe(true)
    tooltip.dispatchEvent(new Event('pointerleave'))
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
  })

  it('shows nothing without content', async () => {
    const tooltip = await mount<LumenTooltip>('<lu-tooltip><button>Copy</button></lu-tooltip>')
    tooltip.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    expect(isPopoverOpen(panel(tooltip))).toBe(false)
  })
})
