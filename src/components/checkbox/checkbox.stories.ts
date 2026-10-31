import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Form/Checkbox',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `A checkbox on the native \`<input type="checkbox">\`: it submits with its form, is checked with \`checked\`, and shows a dash when its \`indeterminate\` property is true, as for a "select all" that covers some rows. Name it with a \`<label>\`, usually a \`.lu-field__choice\`; group several in a \`<fieldset class="lu-field">\`.

| Class | Use |
| --- | --- |
| \`.lu-checkbox\` | The box. Disabled by \`disabled\`, invalid by \`aria-invalid="true"\`. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div class="lu-field">
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" /> Unchecked</label>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" checked /> Checked</label>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" .indeterminate=${true} /> Indeterminate</label>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" aria-invalid="true" /> Invalid</label>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" disabled /> Disabled</label>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" checked disabled /> Checked and disabled</label>
    </div>
  `,
  play: async ({ canvas, userEvent }) => {
    const unchecked = canvas.getByRole('checkbox', { name: 'Unchecked' })
    await userEvent.click(canvas.getByText('Unchecked'))
    await expect(unchecked).toBeChecked()
    await expect(canvas.getByRole('checkbox', { name: 'Indeterminate' })).toBePartiallyChecked()
  },
}
