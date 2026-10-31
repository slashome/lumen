import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Form/Multi-select',
  component: 'lu-multi-select',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-multi-select
      label="Kind"
      .options=${[
        { value: 'task', label: 'Task' },
        { value: 'story', label: 'Story' },
        { value: 'epic', label: 'Epic' },
      ]}
      .selected=${['task']}
    ></lu-multi-select>
  `,
}
