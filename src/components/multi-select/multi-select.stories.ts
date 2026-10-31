import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const MultiSelect: StoryObj = {
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
