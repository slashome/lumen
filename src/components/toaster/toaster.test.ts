import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '../../testing/mount'
import { isPopoverOpen } from '../../lib/popover'
import { toast, toasts } from '../../lib/toast'
import type { LumenToaster } from './toaster'
import './toaster'

beforeEach(() => {
  vi.useFakeTimers()
  toasts.set([])
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
  toasts.set([])
})

function shown(toaster: LumenToaster): HTMLElement[] {
  return [...toaster.shadowRoot!.querySelectorAll<HTMLElement>('[part="toast"]')]
}

function region(toaster: LumenToaster): HTMLElement {
  return toaster.shadowRoot!.querySelector('[part="region"]')!
}

describe('lu-toaster', () => {
  it('shows each toast with its kind, announces the last one, and hides when empty', async () => {
    const toaster = await mount<LumenToaster>('<lu-toaster></lu-toaster>')
    expect(isPopoverOpen(region(toaster))).toBe(false)
    toast.success('Saved')
    toast.danger('Push failed')
    await toaster.updateComplete
    expect(isPopoverOpen(region(toaster))).toBe(true)
    expect(shown(toaster).map((entry) => entry.dataset.kind)).toEqual(['success', 'danger'])
    expect(toaster.shadowRoot!.querySelector('[aria-live="polite"]')?.textContent).toBe('Push failed')

    shown(toaster)[0]!.querySelector<HTMLButtonElement>('.close')!.click()
    await toaster.updateComplete
    expect(shown(toaster).map((entry) => entry.textContent?.trim())).toEqual(['Push failed'])
    shown(toaster)[0]!.querySelector<HTMLButtonElement>('.close')!.click()
    await toaster.updateComplete
    expect(isPopoverOpen(region(toaster))).toBe(false)
  })

  it('closes a toast after its duration, paused while hovered', async () => {
    const toaster = await mount<LumenToaster>('<lu-toaster></lu-toaster>')
    toast.info('Pulled', { duration: 100 })
    await toaster.updateComplete
    shown(toaster)[0]!.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(200)
    expect(toasts.get()).toHaveLength(1)
    shown(toaster)[0]!.dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(100)
    expect(toasts.get()).toHaveLength(0)
  })
})
