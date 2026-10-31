import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { toast } from '../../lib/toast'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Toaster: StoryObj = {
  render: () => html`
    <lu-toaster></lu-toaster>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <button class="lu-button lu-button--outline" @click=${() => toast.success('T104 planned: todo')}>Success</button>
      <button class="lu-button lu-button--outline" @click=${() => toast.error('The workflow has no status in the todo category')}>Error</button>
      <button class="lu-button lu-button--outline" @click=${() => toast.info('Pulled 3 commits')}>Info</button>
      <button class="lu-button lu-button--outline" @click=${() => toast.warning('The branch has diverged')}>Warning</button>
    </div>
  `,
}
