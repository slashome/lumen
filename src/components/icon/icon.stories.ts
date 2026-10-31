import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { iconNames } from '../../lib/icons'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Icon: StoryObj = {
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:0.75rem;font-size:0.75rem">
      ${iconNames().map((name) => html`<span style="display:flex;gap:0.5rem;align-items:center"><lu-icon name=${name}></lu-icon>${name}</span>`)}
    </div>
  `,
}
