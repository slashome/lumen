import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Segmented: StoryObj = {
  render: () => html`<lu-segmented label="Size" .values=${['XS', 'S', 'M', 'L', 'XL']} value="M"></lu-segmented>`,
}
