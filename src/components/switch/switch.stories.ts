import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const Switch: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <label style="display:flex;gap:0.5rem;align-items:center"><input type="checkbox" role="switch" class="lu-switch" checked /> Sub-nodes</label>
    </div>
  `,
}
