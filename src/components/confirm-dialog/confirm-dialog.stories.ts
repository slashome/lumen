import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'

const meta: Meta = {
  title: 'Overlays/Confirm dialog',
  component: 'lu-confirm-dialog',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
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
}
