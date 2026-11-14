import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Data/Highlight',
  component: 'lu-highlight',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/highlight'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`<p><lu-highlight text="La lumière marque l'action, la couleur marque l'état" .terms=${['lumiere', 'etat']}></lu-highlight></p>`,
}
