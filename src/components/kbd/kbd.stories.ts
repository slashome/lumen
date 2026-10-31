import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Data/Kbd',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `A key of a keyboard shortcut, on the native \`<kbd>\`.

| Class | Use |
| --- | --- |
| \`.lu-kbd\` | One key. Write a chord as one \`<kbd>\` per key. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <p>Press <kbd class="lu-kbd">⌘</kbd> <kbd class="lu-kbd">K</kbd></p>
    </div>
  `,
}
