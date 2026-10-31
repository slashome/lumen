import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import './dialog'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('lu-dialog', () => {
  it('opens as a modal and asks to close on Escape', async () => {
    const dialog = await mount<HTMLElement & { open: boolean; updateComplete: Promise<boolean> }>('<lu-dialog heading="Edit"><p>Body</p></lu-dialog>')
    dialog.open = true
    await dialog.updateComplete
    expect(dialog.shadowRoot!.querySelector('dialog')?.hasAttribute('open')).toBe(true)
    const changes: boolean[] = []
    dialog.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<{ open: boolean }>).detail.open))
    dialog.shadowRoot!.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
    expect(changes).toEqual([false])
  })
})
