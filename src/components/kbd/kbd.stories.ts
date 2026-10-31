import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const Kbd: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <p>Press <kbd class="lu-kbd">⌘</kbd> <kbd class="lu-kbd">K</kbd></p>
    </div>
  `,
}
