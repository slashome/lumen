import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Highlight: StoryObj = {
  render: () => html`<p><lu-highlight text="La lumière marque l'action, la couleur marque l'état" .terms=${['lumiere', 'etat']}></lu-highlight></p>`,
}
