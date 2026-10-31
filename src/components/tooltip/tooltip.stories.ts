import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Overlays/Tooltip',
  component: 'lu-tooltip',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-tooltip content="~/workspace/projects/slashome/_ariane">
      <button class="lu-button lu-button--outline">Content repository</button>
    </lu-tooltip>
  `,
}
