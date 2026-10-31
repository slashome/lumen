import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const NativeSelect: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <span class="lu-native-select">
        <select class="lu-native-select__control" aria-label="Status">
          <option>todo</option>
          <option>in progress</option>
          <option>done</option>
        </select>
      </span>
    </div>
  `,
}
