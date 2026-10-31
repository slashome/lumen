import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { OpenChangeDetail } from '../../lib/change'
import type { LumenDialog } from './dialog'
import './dialog'

afterEach(() => {
  document.body.innerHTML = ''
})

function nativeDialog(dialog: LumenDialog): HTMLDialogElement {
  return dialog.shadowRoot!.querySelector('dialog')!
}

function pressEscape(dialog: LumenDialog) {
  nativeDialog(dialog).dispatchEvent(new Event('cancel', { cancelable: true }))
}

async function openDialog(): Promise<{ dialog: LumenDialog; changes: OpenChangeDetail[] }> {
  const dialog = await mount<LumenDialog>('<lu-dialog heading="Edit"><p>Body</p></lu-dialog>')
  dialog.open = true
  await dialog.updateComplete
  const changes: OpenChangeDetail[] = []
  dialog.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<OpenChangeDetail>).detail))
  return { dialog, changes }
}

describe('lu-dialog', () => {
  it('opens as a modal while open is set', async () => {
    const { dialog } = await openDialog()
    expect(nativeDialog(dialog).hasAttribute('open')).toBe(true)
  })

  it('closes itself on Escape, the backdrop and the close button, saying which', async () => {
    const { dialog, changes } = await openDialog()
    pressEscape(dialog)
    await dialog.updateComplete
    expect(dialog.open).toBe(false)
    expect(nativeDialog(dialog).hasAttribute('open')).toBe(false)

    dialog.open = true
    await dialog.updateComplete
    nativeDialog(dialog).click()
    await dialog.updateComplete
    expect(dialog.open).toBe(false)

    dialog.open = true
    await dialog.updateComplete
    dialog.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click()
    await dialog.updateComplete
    expect(dialog.open).toBe(false)

    expect(changes).toEqual([
      { open: false, source: 'escape' },
      { open: false, source: 'outside' },
      { open: false, source: 'close-button' },
    ])
  })

  it('still holds open while lu-open-change runs', async () => {
    const { dialog } = await openDialog()
    const seen: boolean[] = []
    dialog.addEventListener('lu-open-change', () => seen.push(dialog.open))
    pressEscape(dialog)
    expect(seen).toEqual([true])
  })

  it('stays open when lu-open-change is cancelled, and closes when the owner clears open', async () => {
    const { dialog, changes } = await openDialog()
    dialog.addEventListener('lu-open-change', (event) => event.preventDefault())
    pressEscape(dialog)
    nativeDialog(dialog).click()
    dialog.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click()
    await dialog.updateComplete
    expect(changes.map((change) => change.source)).toEqual(['escape', 'outside', 'close-button'])
    expect(dialog.open).toBe(true)
    expect(nativeDialog(dialog).hasAttribute('open')).toBe(true)

    dialog.open = false
    await dialog.updateComplete
    expect(nativeDialog(dialog).hasAttribute('open')).toBe(false)
  })

  it('reports a close it could not prevent, and shows again when that report is cancelled', async () => {
    const { dialog, changes } = await openDialog()
    dialog.addEventListener('lu-open-change', (event) => event.preventDefault())
    nativeDialog(dialog).dispatchEvent(new Event('cancel', { cancelable: false }))
    nativeDialog(dialog).close()
    expect(changes).toEqual([{ open: false, source: 'escape' }])
    expect(nativeDialog(dialog).hasAttribute('open')).toBe(true)
    expect(dialog.open).toBe(true)
  })
})
