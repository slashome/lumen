import type { LumenDialog } from '../src/components/dialog/dialog'

export function openNext(event: Event) {
  const dialog = (event.currentTarget as HTMLElement).nextElementSibling as LumenDialog
  dialog.open = true
}

export function closeSelf(event: Event) {
  ;(event.currentTarget as LumenDialog).open = false
}
