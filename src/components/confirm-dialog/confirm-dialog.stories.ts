import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const ConfirmDialog: StoryObj = {
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
}
