import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { OpenChangeDetail } from '../../lib/change'
import type { LumenConfirmDialog } from './confirm-dialog'
import './confirm-dialog'

afterEach(() => {
  document.body.innerHTML = ''
})

function buttons(dialog: LumenConfirmDialog) {
  const [cancel, confirm] = dialog.shadowRoot!.querySelectorAll<HTMLButtonElement>('.actions button')
  return { cancel: cancel!, confirm: confirm! }
}

describe('lu-confirm-dialog', () => {
  it('shows an alertdialog with its labels, the confirm button drawn as danger', async () => {
    const dialog = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" confirm-label="Delete" cancel-label="Keep" open></lu-confirm-dialog>')
    const native = dialog.shadowRoot!.querySelector('dialog')!
    expect(native.getAttribute('role')).toBe('alertdialog')
    expect(native.hasAttribute('open')).toBe(true)
    const { cancel, confirm } = buttons(dialog)
    expect(cancel.textContent?.trim()).toBe('Keep')
    expect(confirm.textContent?.trim()).toBe('Delete')
    expect(confirm.classList.contains('lu-button--danger')).toBe(true)
  })

  it('fires lu-confirm from the confirm button and stays open for the owner to close', async () => {
    const dialog = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" open></lu-confirm-dialog>')
    const events: string[] = []
    dialog.addEventListener('lu-confirm', () => events.push('confirm'))
    dialog.addEventListener('lu-open-change', () => events.push('open-change'))
    buttons(dialog).confirm.click()
    await dialog.updateComplete
    expect(events).toEqual(['confirm'])
    expect(dialog.open).toBe(true)
  })

  it('closes itself on the cancel button and on Escape, saying which', async () => {
    const dialog = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" open></lu-confirm-dialog>')
    const changes: OpenChangeDetail[] = []
    dialog.addEventListener('lu-open-change', (event) => changes.push((event as CustomEvent<OpenChangeDetail>).detail))
    buttons(dialog).cancel.click()
    await dialog.updateComplete
    expect(dialog.open).toBe(false)
    dialog.open = true
    await dialog.updateComplete
    dialog.shadowRoot!.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
    await dialog.updateComplete
    expect(dialog.open).toBe(false)
    expect(changes).toEqual([
      { open: false, source: 'cancel' },
      { open: false, source: 'escape' },
    ])
  })

  it('stays open when lu-open-change is cancelled', async () => {
    const dialog = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" open></lu-confirm-dialog>')
    dialog.addEventListener('lu-open-change', (event) => event.preventDefault())
    buttons(dialog).cancel.click()
    dialog.shadowRoot!.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
    await dialog.updateComplete
    expect(dialog.open).toBe(true)
    expect(dialog.shadowRoot!.querySelector('dialog')!.hasAttribute('open')).toBe(true)
  })

  it('ignores a click on the backdrop', async () => {
    const dialog = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" open></lu-confirm-dialog>')
    const events: Event[] = []
    dialog.addEventListener('lu-open-change', (event) => events.push(event))
    dialog.shadowRoot!.querySelector('dialog')!.click()
    expect(events).toEqual([])
  })

  it('disables the confirm button while pending', async () => {
    const dialog = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" open pending></lu-confirm-dialog>')
    expect(buttons(dialog).confirm.disabled).toBe(true)
    dialog.pending = false
    await dialog.updateComplete
    expect(buttons(dialog).confirm.disabled).toBe(false)
  })
})
