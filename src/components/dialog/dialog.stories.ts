import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { closeSelf, openNext } from '../../../stories/dialog-triggers'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Dialog: StoryObj = {
  render: () => html`
    <button class="lu-button" @click=${openNext}>Open the dialog</button>
    <lu-dialog heading="Edit T104" description="The fields of the item header." @lu-open-change=${closeSelf}>
      <input class="lu-input" aria-label="Title" value="The token and the light effect" />
    </lu-dialog>
  `,
}
