import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { keepOpenWhileChecked, openNext } from '../../../stories/dialog-triggers'
import { playControlledModal, playModal } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Dialog',
  component: 'lu-dialog',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/dialog'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <button class="lu-button" @click=${openNext}>Open the dialog</button>
    <lu-dialog heading="Edit T104" description="The fields of the item header.">
      <input class="lu-input" aria-label="Title" value="The token and the light effect" />
    </lu-dialog>
  `,
  play: (context) => playModal(context, 'lu-dialog', 'Open the dialog'),
}

export const Controlled: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'The owner cancels every `lu-open-change` and sets `open` from `detail.open` only when the box is unchecked: the dialog stays open whatever the user does until then.',
      },
    },
  },
  render: () => html`
    <button class="lu-button" @click=${openNext}>Open the dialog</button>
    <lu-dialog heading="Unsaved changes" @lu-open-change=${keepOpenWhileChecked}>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" name="keep-open" checked /> Keep it open</label>
    </lu-dialog>
  `,
  play: (context) => playControlledModal(context, 'lu-dialog', 'Open the dialog'),
}
