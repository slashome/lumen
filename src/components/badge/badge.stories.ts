import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const Badge: StoryObj = {
  render: () => html`
    <span class="lu-badge">todo</span>
    <span class="lu-badge lu-badge--outline">backlog</span>
    <span class="lu-badge lu-badge--primary">in progress</span>
  `,
}
