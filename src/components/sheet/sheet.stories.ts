import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Sheet: StoryObj = {
  render: () => html`
    <button class="lu-button lu-button--outline" @click=${openNext}>Open the sheet</button>
    <lu-sheet heading="T104 — The token and the light effect" @lu-open-change=${closeSelf}>
      <lu-markdown source="One token sets the duration, the curve and the intensity of the flash."></lu-markdown>
    </lu-sheet>
  `,
}
