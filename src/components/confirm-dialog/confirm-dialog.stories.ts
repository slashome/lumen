import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'
import { inShadow, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Confirm dialog',
  component: 'lu-confirm-dialog',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/confirm-dialog'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <button class="lu-button lu-button--destructive" @click=${openNext}>Delete</button>
    <lu-confirm-dialog
      heading="Delete T104?"
      description="The file is removed from the tree; git keeps its history."
      confirm-label="Delete"
      @lu-open-change=${closeSelf}
      @lu-confirm=${closeSelf}
    ></lu-confirm-dialog>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector('lu-confirm-dialog')
    const dialog = inShadow<HTMLDialogElement>(host, 'dialog')
    const cancel = inShadow(host, '.actions .lu-button--outline')
    const confirm = inShadow(host, '.actions .lu-button--destructive')
    const opener = canvas.getByRole('button', { name: 'Delete' })
    const confirms = recordEvents(canvasElement, 'lu-confirm')
    const openChanges = recordEvents(canvasElement, 'lu-open-change')

    const open = async () => {
      await userEvent.click(opener)
      await waitFor(() => expect(dialog).toHaveAttribute('open'))
    }
    const expectClosed = async () => {
      await expect(dialog).not.toHaveAttribute('open')
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

    await step('A close request, as Escape sends, asks the owner to close', async () => {
      await open()
      dialog.requestClose()
      await expect(openChanges).toHaveBeenCalledOnce()
      await expect(openChanges).toHaveBeenLastCalledWith({ open: false })
      await expectClosed()
    })

    await step('The cancel button asks the owner to close', async () => {
      await open()
      await userEvent.click(cancel)
      await expect(openChanges).toHaveBeenCalledTimes(2)
      await expect(confirms).toHaveBeenCalledOnce()
      await expectClosed()
    })
  },
}
