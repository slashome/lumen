import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Form/Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A text field on the native \`<input>\`, at the control height. Name it with a \`<label>\` or \`aria-label\`.

| Class | Use |
| --- | --- |
| \`.lu-input\` | The field. Disabled by \`disabled\`, invalid by \`aria-invalid="true"\`. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <input class="lu-input" placeholder="Search items" aria-label="Search items" />
    </div>
  `,
}
