import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { OpenChangeDetail } from '../../lib/change'
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

  it('closes itself on Escape, the backdrop and the close button, saying which', async () => {
    const sheet = await mount<LumenSheet>('<lu-sheet heading="T104"></lu-sheet>')
    const changes: OpenChangeDetail[] = []
    sheet.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<OpenChangeDetail>).detail))
    const closers = [
      () => nativeDialog(sheet).dispatchEvent(new Event('cancel', { cancelable: true })),
      () => nativeDialog(sheet).click(),
      () => sheet.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click(),
    ]
    for (const close of closers) {
      sheet.open = true
      await sheet.updateComplete
      close()
      await sheet.updateComplete
      expect(sheet.open).toBe(false)
      expect(nativeDialog(sheet).hasAttribute('open')).toBe(false)
    }
    expect(changes.map((change) => change.source)).toEqual(['escape', 'outside', 'close-button'])
  })

  it('stays open when lu-open-change is cancelled', async () => {
    const sheet = await mount<LumenSheet>('<lu-sheet heading="T104" open></lu-sheet>')
    sheet.addEventListener('lu-open-change', (event) => event.preventDefault())
    nativeDialog(sheet).dispatchEvent(new Event('cancel', { cancelable: true }))
    nativeDialog(sheet).click()
    sheet.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click()
    await sheet.updateComplete
    expect(sheet.open).toBe(true)
    expect(nativeDialog(sheet).hasAttribute('open')).toBe(true)
  })
})
