import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import type { OpenChangeDetail } from '../../lib/change'
import type { LumenConfirmDialog } from './confirm-dialog'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'
import { inShadow, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Confirm dialog',
  component: 'lu-confirm-dialog',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/confirm-dialog'" } },
}
export default meta

function startPending(event: Event) {
  ;(event.currentTarget as LumenConfirmDialog).pending = true
}

function refuseWhilePending(event: CustomEvent<OpenChangeDetail>) {
  const dialog = event.currentTarget as LumenConfirmDialog
  if (dialog.pending) {
    event.preventDefault()
  }
}

export const Default: StoryObj = {
  render: () => html`
    <button class="lu-button lu-button--danger" @click=${openNext}>Delete</button>
    <lu-confirm-dialog
      heading="Delete T104?"
      description="The file is removed from the tree; git keeps its history."
      confirm-label="Delete"
      @lu-confirm=${closeSelf}
    ></lu-confirm-dialog>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector('lu-confirm-dialog')
    const dialog = inShadow<HTMLDialogElement>(host, 'dialog')
    const cancel = inShadow(host, '.actions .lu-button--outline')
    const confirm = inShadow(host, '.actions .lu-button--danger')
    const opener = canvas.getByRole('button', { name: 'Delete' })
    const confirms = recordEvents(canvasElement, 'lu-confirm')
    const openChanges = recordEvents(canvasElement, 'lu-open-change')

    const open = async () => {
      await userEvent.click(opener)
      await waitFor(() => expect(dialog).toHaveAttribute('open'))
    }
    const expectClosed = async () => {
      await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
      await expect(opener).toHaveFocus()
    }

    await step('The opener shows an alertdialog with the focus on the cancel button', async () => {
      await open()
      await expect(dialog).toHaveAttribute('role', 'alertdialog')
      await expect(dialog).toHaveAccessibleName('Delete T104?')
      await expect(host?.shadowRoot?.activeElement).toBe(cancel)
    })

    await step('A click on the backdrop does not close it', async () => {
      await userEvent.click(dialog)
      await expect(openChanges).not.toHaveBeenCalled()
      await expect(dialog).toHaveAttribute('open')
    })

    await step('The confirm button fires lu-confirm and the owner closes it', async () => {
      await userEvent.click(confirm)
      await expect(confirms).toHaveBeenCalledOnce()
      await expect(confirms).toHaveBeenCalledWith({})
      await expect(openChanges).not.toHaveBeenCalled()
      await expectClosed()
    })

    await step('A close request, as Escape sends, closes it by itself', async () => {
      await open()
      dialog.requestClose()
      await expect(openChanges).toHaveBeenCalledOnce()
      await expect(openChanges).toHaveBeenLastCalledWith({ open: false, source: 'escape' })
      await expectClosed()
    })

    await step('The cancel button closes it by itself', async () => {
      await open()
      await userEvent.click(cancel)
      await expect(openChanges).toHaveBeenCalledTimes(2)
      await expect(openChanges).toHaveBeenLastCalledWith({ open: false, source: 'cancel' })
      await expect(confirms).toHaveBeenCalledOnce()
      await expectClosed()
    })
  },
}

export const Controlled: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'The owner cancels `lu-open-change` while the action runs, so the dialog cannot be dismissed half-way, and closes it itself once the action is done.',
      },
    },
  },
  render: () => html`
    <button class="lu-button lu-button--danger" @click=${openNext}>Delete</button>
    <lu-confirm-dialog heading="Delete T104?" confirm-label="Delete" @lu-open-change=${refuseWhilePending} @lu-confirm=${startPending}></lu-confirm-dialog>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector<LumenConfirmDialog>('lu-confirm-dialog')
    const dialog = inShadow<HTMLDialogElement>(host, 'dialog')
    const cancel = inShadow(host, '.actions .lu-button--outline')
    const confirm = inShadow(host, '.actions .lu-button--danger')
    const openChanges = recordEvents(canvasElement, 'lu-open-change')

    await step('The opener shows the dialog, and the confirm button starts the action', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete' }))
      await waitFor(() => expect(dialog).toHaveAttribute('open'))
      await userEvent.click(confirm)
      await expect(host?.pending).toBe(true)
    })

    await step('While the owner cancels lu-open-change, neither Escape nor the cancel button closes it', async () => {
      dialog.requestClose()
      await userEvent.click(cancel)
      await waitFor(() => expect(openChanges).toHaveBeenCalledTimes(2))
      await expect(openChanges.mock.calls.map(([detail]) => detail.source)).toEqual(['escape', 'cancel'])
      await waitFor(() => expect(dialog).toHaveAttribute('open'))
      await expect(host?.open).toBe(true)
    })

    await step('The owner closes it once the action is done', async () => {
      if (host) {
        host.pending = false
        host.open = false
      }
      await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
    })
  },
}

export const RegisteredLabel: StoryObj = {
  name: 'Registered confirm label',
  parameters: {
    docs: {
      description: {
        story: 'Without `confirm-label`, the confirm button takes the `confirm` message registered with `registerLumenMessages()`. Prefer a `confirm-label` that names the action where it is destructive.',
      },
    },
  },
  render: () => html`
    <button class="lu-button lu-button--outline" @click=${openNext}>Archive</button>
    <lu-confirm-dialog heading="Archive T104?" @lu-confirm=${closeSelf}></lu-confirm-dialog>
  `,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const host = canvasElement.querySelector('lu-confirm-dialog')
    const dialog = inShadow<HTMLDialogElement>(host, 'dialog')
    await userEvent.click(canvas.getByRole('button', { name: 'Archive' }))
    await waitFor(() => expect(dialog).toHaveAttribute('open'))
    await expect(inShadow(host, '.actions .lu-button--danger')).toHaveTextContent('Confirm')
    dialog.requestClose()
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
  },
}
