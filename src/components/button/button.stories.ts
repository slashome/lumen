import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const Button: StoryObj = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
      <button class="lu-button">Default</button>
      <button class="lu-button lu-button--outline">Outline</button>
      <button class="lu-button lu-button--ghost">Ghost</button>
      <button class="lu-button lu-button--destructive">Delete</button>
      <button class="lu-button lu-button--sm">Small</button>
      <button class="lu-button lu-button--outline lu-button--icon" aria-label="Add"><lu-icon name="add"></lu-icon></button>
      <button class="lu-icon-button" aria-label="Copy"><lu-icon name="copy"></lu-icon></button>
      <button class="lu-button" disabled>Disabled</button>
    </div>
  `,
}
