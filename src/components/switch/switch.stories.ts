import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Form/Switch',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `An on/off switch on a native checkbox with \`role="switch"\`: it submits with its form and is checked with \`checked\`. Name it with a \`<label>\`.

| Class | Use |
| --- | --- |
| \`.lu-switch\` | The switch, on an \`<input type="checkbox" role="switch">\`. Disabled by \`disabled\`. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <label style="display:flex;gap:0.5rem;align-items:center"><input type="checkbox" role="switch" class="lu-switch" checked /> Sub-nodes</label>
    </div>
  `,
}
