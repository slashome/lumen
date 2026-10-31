import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Form/Segmented',
  component: 'lu-segmented',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`<lu-segmented label="Size" .values=${['XS', 'S', 'M', 'L', 'XL']} value="M"></lu-segmented>`,
}
