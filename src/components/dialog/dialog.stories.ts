import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'
import { playModal } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Dialog',
  component: 'lu-dialog',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <button class="lu-button" @click=${openNext}>Open the dialog</button>
    <lu-dialog heading="Edit T104" description="The fields of the item header." @lu-open-change=${closeSelf}>
      <input class="lu-input" aria-label="Title" value="The token and the light effect" />
    </lu-dialog>
  `,
  play: (context) => playModal(context, 'lu-dialog', 'Open the dialog'),
}
