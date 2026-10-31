import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'
import { playModal } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Sheet',
  component: 'lu-sheet',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <button class="lu-button lu-button--outline" @click=${openNext}>Open the sheet</button>
    <lu-sheet heading="T104 — The token and the light effect" @lu-open-change=${closeSelf}>
      <lu-markdown source="One token sets the duration, the curve and the intensity of the flash."></lu-markdown>
    </lu-sheet>
  `,
  play: (context) => playModal(context, 'lu-sheet', 'Open the sheet'),
}
