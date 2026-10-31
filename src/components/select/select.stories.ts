import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Select: StoryObj = {
  render: () => html`
    <lu-select label="Status" value="todo" style="inline-size:14rem">
      <lu-option value="backlog">backlog</lu-option>
      <lu-option value="todo">todo</lu-option>
      <lu-option value="in_progress">in progress</lu-option>
      <lu-option value="done">done</lu-option>
      <lu-option value="dropped" disabled>dropped</lu-option>
    </lu-select>
  `,
}
