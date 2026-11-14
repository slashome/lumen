import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { keepOpenWhileChecked, openNext } from '../../../stories/dialog-triggers'
import { playControlledModal, playModal } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Sheet',
  component: 'lu-sheet',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/sheet'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <button class="lu-button lu-button--outline" @click=${openNext}>Open the sheet</button>
    <lu-sheet heading="T104 — The token and the light effect">
      <lu-markdown source="One token sets the duration, the curve and the intensity of the flash."></lu-markdown>
    </lu-sheet>
  `,
  play: (context) => playModal(context, 'lu-sheet', 'Open the sheet'),
}

export const Controlled: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'The owner cancels every `lu-open-change` and sets `open` from `detail.open` only when the box is unchecked: the sheet stays open whatever the user does until then.',
      },
    },
  },
  render: () => html`
    <button class="lu-button lu-button--outline" @click=${openNext}>Open the sheet</button>
    <lu-sheet heading="Unsaved changes" @lu-open-change=${keepOpenWhileChecked}>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" name="keep-open" checked /> Keep it open</label>
    </lu-sheet>
  `,
  play: (context) => playControlledModal(context, 'lu-sheet', 'Open the sheet'),
}
