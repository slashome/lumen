import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
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

  it('fires lu-confirm from the confirm button, and lu-open-change from the cancel button', async () => {
    const dialog = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" open></lu-confirm-dialog>')
    const events: string[] = []
    dialog.addEventListener('lu-confirm', () => events.push('confirm'))
    dialog.addEventListener('lu-open-change', () => events.push('open-change'))
    const { cancel, confirm } = buttons(dialog)
    confirm.click()
    cancel.click()
    expect(events).toEqual(['confirm', 'open-change'])
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
