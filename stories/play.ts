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
  const expectClosedBy = async (requests: number, source: string) => {
    await expect(openChanges).toHaveBeenCalledTimes(requests)
    await expect(openChanges).toHaveBeenLastCalledWith({ open: false, source })
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
    await expect(host?.open).toBe(false)
    await expect(opener).toHaveFocus()
  }

  await step('The opener shows the modal and moves the focus into it', open)

  await step('A close request, as Escape sends, closes it by itself and restores the focus', async () => {
    dialog.requestClose()
    await expectClosedBy(1, 'escape')
  })

  await step('The close button closes it by itself', async () => {
    await open()
    await userEvent.click(inShadow(host, '.close'))
    await expectClosedBy(2, 'close-button')
  })

  await step('A click on the backdrop closes it by itself', async () => {
    await open()
    await userEvent.click(dialog)
    await expectClosedBy(3, 'outside')
  })
}

export async function playControlledModal({ canvas, canvasElement, userEvent, step }: PlayContext, tag: 'lu-dialog' | 'lu-sheet', openLabel: string) {
  const host = canvasElement.querySelector<LumenDialog>(tag)
  const dialog = inShadow<HTMLDialogElement>(host, 'dialog')
  const opener = canvas.getByRole('button', { name: openLabel })
  const openChanges = recordEvents(canvasElement, 'lu-open-change')
  const keepOpen = canvas.getByRole('checkbox', { name: 'Keep it open' })

  await step('The opener shows the modal', async () => {
    await userEvent.click(opener)
    await waitFor(() => expect(dialog).toHaveAttribute('open'))
  })

  await step('While the owner cancels lu-open-change, neither Escape, the backdrop nor the close button closes it', async () => {
    dialog.requestClose()
    await userEvent.click(dialog)
    await userEvent.click(inShadow(host, '.close'))
    await waitFor(() => expect(openChanges).toHaveBeenCalledTimes(3))
    await expect(openChanges.mock.calls.map(([detail]) => detail.source)).toEqual(['escape', 'outside', 'close-button'])
    await waitFor(() => expect(dialog).toHaveAttribute('open'))
    await expect(host?.open).toBe(true)
  })

  await step('Once the owner sets open from the event, the close button closes it', async () => {
    await userEvent.click(keepOpen)
    await expect(keepOpen).not.toBeChecked()
    await userEvent.click(inShadow(host, '.close'))
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
    await expect(host?.open).toBe(false)
  })
}
