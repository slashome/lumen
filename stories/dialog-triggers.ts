import type { OpenChangeDetail } from '../src/lib/change'
import type { LumenDialog } from '../src/components/dialog/dialog'

export function openNext(event: Event) {
  const dialog = (event.currentTarget as HTMLElement).nextElementSibling as LumenDialog
  dialog.open = true
}

export function closeSelf(event: Event) {
  ;(event.currentTarget as LumenDialog).open = false
}

export function keepOpenWhileChecked(event: CustomEvent<OpenChangeDetail>) {
  event.preventDefault()
  const dialog = event.currentTarget as LumenDialog
  const keep = dialog.querySelector<HTMLInputElement>('input[name="keep-open"]')
  if (!keep?.checked) {
    dialog.open = event.detail.open
  }
}
