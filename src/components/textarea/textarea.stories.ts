import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Form/Textarea',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A multi-line text field on the native \`<textarea>\`, at least two control heights tall and resizable in height. Set its height with \`rows\`. Name it with a \`<label>\`, inside a \`.lu-field\` for a hint or an error.

| Class | Use |
| --- | --- |
| \`.lu-textarea\` | The field. Disabled by \`disabled\`, invalid by \`aria-invalid="true"\`. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:24rem">
      <textarea class="lu-textarea" rows="3" placeholder="What changed, and why" aria-label="Description"></textarea>
      <textarea class="lu-textarea" rows="3" aria-label="Invalid description" aria-invalid="true">Too short</textarea>
      <textarea class="lu-textarea" rows="3" aria-label="Disabled description" disabled>Read only for now</textarea>
    </div>
  `,
}
