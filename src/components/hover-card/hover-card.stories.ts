import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Overlays/Hover card',
  component: 'lu-hover-card',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-hover-card open-delay="100" placement="bottom-start">
      <button slot="trigger" class="lu-button lu-button--outline">3 uncommitted changes</button>
      <p style="margin:0">Commit everything, commit per node, or push.</p>
    </lu-hover-card>
  `,
}
