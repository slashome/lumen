import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Data/Badge',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `A short label for a status, a kind or a count, on a \`<span>\`.

| Class | Use |
| --- | --- |
| \`.lu-badge\` | The badge, on a muted fill. |
| \`.lu-badge--outline\` | Variant: a border on a transparent fill. |
| \`.lu-badge--primary\` | Variant: the primary fill, for the one badge that must stand out. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <span class="lu-badge">todo</span>
    <span class="lu-badge lu-badge--outline">backlog</span>
    <span class="lu-badge lu-badge--primary">in progress</span>
  `,
}
