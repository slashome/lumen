import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Tooltip: StoryObj = {
  render: () => html`
    <lu-tooltip content="~/workspace/projects/slashome/_ariane">
      <button class="lu-button lu-button--outline">Content repository</button>
    </lu-tooltip>
  `,
}
