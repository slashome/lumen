import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Form/Native select',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `A select on the native \`<select>\`, styled to match the inputs: the platform picker, on every device. Use it in forms; use \`<lu-select>\` when the options need markup.

| Class | Use |
| --- | --- |
| \`.lu-native-select\` | The \`<span>\` wrapper that draws the chevron. |
| \`.lu-native-select__control\` | The \`<select>\` inside it. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <span class="lu-native-select">
        <select class="lu-native-select__control" aria-label="Status">
          <option>todo</option>
          <option>in progress</option>
          <option>done</option>
        </select>
      </span>
    </div>
  `,
}
