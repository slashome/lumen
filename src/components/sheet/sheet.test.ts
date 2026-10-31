import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { LumenSheet } from './sheet'
import './sheet'

afterEach(() => {
  document.body.innerHTML = ''
})

function nativeDialog(sheet: LumenSheet): HTMLDialogElement {
  return sheet.shadowRoot!.querySelector('dialog')!
}

describe('lu-sheet', () => {
  it('shows its dialog as a modal while open is set', async () => {
    const sheet = await mount<LumenSheet>('<lu-sheet heading="T104"><p>Body</p></lu-sheet>')
    expect(nativeDialog(sheet).hasAttribute('open')).toBe(false)
    sheet.open = true
    await sheet.updateComplete
    expect(nativeDialog(sheet).hasAttribute('open')).toBe(true)
    sheet.open = false
    await sheet.updateComplete
    expect(nativeDialog(sheet).hasAttribute('open')).toBe(false)
  })

  it('names itself by its heading and describes itself by its description', async () => {
    const sheet = await mount<LumenSheet>('<lu-sheet heading="T104" description="The item"></lu-sheet>')
    const dialog = nativeDialog(sheet)
    expect(sheet.shadowRoot!.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toContain('T104')
    expect(sheet.shadowRoot!.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toContain('The item')
  })

  it('fires lu-open-change from its close button', async () => {
    const sheet = await mount<LumenSheet>('<lu-sheet heading="T104" open></lu-sheet>')
    const changes: boolean[] = []
    sheet.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<{ open: boolean }>).detail.open))
    sheet.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click()
    expect(changes).toEqual([false])
  })
})
