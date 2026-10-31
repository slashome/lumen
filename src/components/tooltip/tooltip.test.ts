import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OpenChangeDetail } from '../../lib/change'
import { isPopoverOpen } from '../../lib/popover'
import type { LumenTooltip } from './tooltip'
import './tooltip'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

function pressEscape(target: Element) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }))
}

async function setUp(markup = '<button id="copy">Copy</button><lu-tooltip for="copy" delay="100">Copy the command</lu-tooltip>') {
  document.body.innerHTML = markup
  const tooltip = document.querySelector<LumenTooltip>('lu-tooltip')!
  await tooltip.updateComplete
  const trigger = document.querySelector('button')!
  const changes: OpenChangeDetail[] = []
  tooltip.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<OpenChangeDetail>).detail))
  return { tooltip, trigger, changes }
}

async function flushObservers() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('lu-tooltip', () => {
  it('is the popover itself, a tooltip that describes the trigger named by for', async () => {
    const { tooltip, trigger } = await setUp()
    expect(tooltip.getAttribute('role')).toBe('tooltip')
    expect(tooltip.getAttribute('popover')).toBe('manual')
    expect(tooltip.id).toMatch(/^lu-tooltip-\d+$/)
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)
  })

  it('keeps the ids the trigger was already described by, and its own id', async () => {
    const { tooltip, trigger } = await setUp('<button id="copy" aria-describedby="hint">Copy</button><lu-tooltip id="copy-tip" for="copy">Copy the command</lu-tooltip>')
    expect(trigger.getAttribute('aria-describedby')).toBe('hint copy-tip')
    tooltip.remove()
    expect(trigger.getAttribute('aria-describedby')).toBe('hint')
  })

  it('opens itself after its delay once the trigger has the focus, and closes on Escape', async () => {
    const { tooltip, trigger, changes } = await setUp()
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
    vi.advanceTimersByTime(99)
    expect(changes).toEqual([])
    vi.advanceTimersByTime(1)
    await tooltip.updateComplete
    expect(tooltip.open).toBe(true)
    expect(isPopoverOpen(tooltip)).toBe(true)
    pressEscape(trigger)
    await tooltip.updateComplete
    expect(tooltip.open).toBe(false)
    expect(isPopoverOpen(tooltip)).toBe(false)
    expect(changes).toEqual([
      { open: true, source: 'trigger' },
      { open: false, source: 'escape' },
    ])
  })

  it('closes itself when the pointer leaves the trigger', async () => {
    const { tooltip, trigger, changes } = await setUp()
    trigger.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    trigger.dispatchEvent(new Event('pointerleave'))
    await tooltip.updateComplete
    expect(isPopoverOpen(tooltip)).toBe(false)
    expect(changes).toEqual([
      { open: true, source: 'trigger' },
      { open: false, source: 'trigger' },
    ])
  })

  it('still holds open while lu-open-change runs', async () => {
    const { tooltip, trigger } = await setUp()
    const seen: boolean[] = []
    tooltip.addEventListener('lu-open-change', () => seen.push(tooltip.open))
    trigger.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    expect(seen).toEqual([false])
  })

  it('is controlled by cancelling lu-open-change and setting open', async () => {
    const { tooltip, trigger } = await setUp()
    tooltip.addEventListener('lu-open-change', (event) => event.preventDefault())
    trigger.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    await tooltip.updateComplete
    expect(isPopoverOpen(tooltip)).toBe(false)

    tooltip.open = true
    await tooltip.updateComplete
    expect(isPopoverOpen(tooltip)).toBe(true)
    pressEscape(trigger)
    trigger.dispatchEvent(new Event('pointerleave'))
    await tooltip.updateComplete
    expect(isPopoverOpen(tooltip)).toBe(true)

    tooltip.open = false
    await tooltip.updateComplete
    expect(isPopoverOpen(tooltip)).toBe(false)
  })

  it('shows nothing and fires nothing without content', async () => {
    const { tooltip, trigger, changes } = await setUp('<button id="copy">Copy</button><lu-tooltip for="copy"> </lu-tooltip>')
    trigger.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    await tooltip.updateComplete
    expect(isPopoverOpen(tooltip)).toBe(false)
    expect(changes).toEqual([])
  })

  it('binds a trigger that gets its id after the tooltip', async () => {
    const { tooltip, trigger } = await setUp('<button>Copy</button><lu-tooltip for="copy">Copy the command</lu-tooltip>')
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    trigger.id = 'copy'
    await flushObservers()
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)
  })

  it('binds a trigger added after the tooltip', async () => {
    const { tooltip } = await setUp('<lu-tooltip for="copy">Copy the command</lu-tooltip>')
    const trigger = document.createElement('button')
    trigger.id = 'copy'
    document.body.prepend(trigger)
    await flushObservers()
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)
  })

  it('moves from one trigger to another when for changes, and lets the first one go', async () => {
    const { tooltip, trigger } = await setUp('<button id="copy">Copy</button><button id="paste">Paste</button><lu-tooltip for="copy">A command</lu-tooltip>')
    const paste = document.getElementById('paste')!
    tooltip.htmlFor = 'paste'
    await tooltip.updateComplete
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    expect(paste.getAttribute('aria-describedby')).toBe(tooltip.id)
    trigger.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    expect(tooltip.open).toBe(false)
  })

  it('takes the anchor property over for', async () => {
    const { tooltip, trigger } = await setUp('<button id="copy">Copy</button><button id="paste">Paste</button><lu-tooltip for="copy">A command</lu-tooltip>')
    const paste = document.getElementById('paste')!
    tooltip.anchor = paste
    await tooltip.updateComplete
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    expect(paste.getAttribute('aria-describedby')).toBe(tooltip.id)
  })

  it('lets its trigger go when it is removed', async () => {
    const { tooltip, trigger } = await setUp()
    tooltip.remove()
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    trigger.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(tooltip.delay)
    expect(tooltip.open).toBe(false)
  })

  it('resolves for in the shadow root that holds it', async () => {
    document.body.innerHTML = '<div></div><button id="copy">Outside</button>'
    const root = document.querySelector('div')!.attachShadow({ mode: 'open' })
    root.innerHTML = '<button id="copy">Inside</button><lu-tooltip for="copy">Copy the command</lu-tooltip>'
    const tooltip = root.querySelector<LumenTooltip>('lu-tooltip')!
    await tooltip.updateComplete
    expect(root.querySelector('button')!.getAttribute('aria-describedby')).toBe(tooltip.id)
    expect(document.querySelector('button')!.hasAttribute('aria-describedby')).toBe(false)
  })

  it('reports a tooltip with neither for nor anchor', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    await setUp('<lu-tooltip>Copy the command</lu-tooltip>')
    expect(error).toHaveBeenCalledWith(expect.stringContaining('<lu-tooltip> needs for (or the anchor property)'))
  })
})
