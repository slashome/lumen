import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { LumenSegmented } from './segmented'
import './segmented'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('lu-segmented', () => {
  it('presses a value, and unsets it when pressed again', async () => {
    const segmented = await mount<LumenSegmented>('<lu-segmented label="Size"></lu-segmented>')
    segmented.values = ['S', 'M']
    await segmented.updateComplete
    const changes: (string | null)[] = []
    segmented.addEventListener('lu-value-change', (event) => changes.push((event as CustomEvent<{ value: string | null }>).detail.value))
    const [small] = segmented.shadowRoot!.querySelectorAll('button')
    small!.click()
    await segmented.updateComplete
    small!.click()
    expect(changes).toEqual(['S', null])
  })

  it('keeps its value when a listener cancels lu-value-change', async () => {
    const segmented = await mount<LumenSegmented>('<lu-segmented label="Size"></lu-segmented>')
    segmented.values = ['S', 'M']
    await segmented.updateComplete
    const seen: (string | null)[] = []
    segmented.addEventListener('lu-value-change', (event) => {
      seen.push(segmented.value)
      event.preventDefault()
    })
    segmented.shadowRoot!.querySelector('button')!.click()
    await segmented.updateComplete
    expect(seen).toEqual([null])
    expect(segmented.value).toBeNull()
  })
})
