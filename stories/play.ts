import type { StoryObj } from '@storybook/web-components-vite'
import { expect, fn, waitFor } from 'storybook/test'
import type { LumenDialog } from '../src/components/dialog/dialog'

export type PlayContext = Parameters<NonNullable<StoryObj['play']>>[0]

export function recordEvents(target: EventTarget, name: string) {
  const listener = fn().mockName(name)
  target.addEventListener(name, (event) => listener((event as CustomEvent).detail))
  return listener
}

export function inShadow<Found extends Element = HTMLElement>(host: Element | null, selector: string): Found {
  const found = host?.shadowRoot?.querySelector<Found>(selector)
  if (!found) {
    throw new Error(`Nothing matches ${selector} in the shadow root of ${host?.localName ?? 'a missing host'}`)
  }
  return found
}

export function isOpen(popover: Element): boolean {
  return popover.matches(':popover-open')
}

export async function playModal({ canvas, canvasElement, userEvent, step }: PlayContext, tag: 'lu-dialog' | 'lu-sheet', openLabel: string) {
  const host = canvasElement.querySelector<LumenDialog>(tag)
  const dialog = inShadow<HTMLDialogElement>(host, 'dialog')
  const opener = canvas.getByRole('button', { name: openLabel })
  const openChanges = recordEvents(canvasElement, 'lu-open-change')

  const open = async () => {
    await userEvent.click(opener)
    await waitFor(() => expect(dialog).toHaveAttribute('open'))
    await expect(host?.shadowRoot?.activeElement ?? document.activeElement).not.toBe(opener)
  }
  const expectClosed = async (requests: number) => {
    await expect(openChanges).toHaveBeenCalledTimes(requests)
    await expect(openChanges).toHaveBeenLastCalledWith({ open: false })
    await expect(dialog).not.toHaveAttribute('open')
    await expect(opener).toHaveFocus()
  }

  await step('The opener shows the modal and moves the focus into it', open)

  await step('A close request, as Escape sends, asks the owner to close and restores the focus', async () => {
    dialog.requestClose()
    await expectClosed(1)
  })

  await step('The close button asks the owner to close', async () => {
    await open()
    await userEvent.click(inShadow(host, '.close'))
    await expectClosed(2)
  })

  await step('A click on the backdrop asks the owner to close', async () => {
    await open()
    await userEvent.click(dialog)
    await expectClosed(3)
  })
}
