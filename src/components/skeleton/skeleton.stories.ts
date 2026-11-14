import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Feedback/Skeleton',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A pulsing placeholder in the shape of the content that is loading. It pulses on the \`muted\` fill and stands still under \`prefers-reduced-motion\`. Size it with \`inline-size\` and \`block-size\`; it is a control high by default.

A skeleton means nothing to a screen reader: give each one \`aria-hidden="true"\`, and the region that loads \`aria-busy="true"\` and a \`role="status"\` with an \`aria-label\` such as "Loading…". For rows of a list, \`.lu-loading-state\` in Feedback/States is ready-made.

| Class | Use |
| --- | --- |
| \`.lu-skeleton\` | The placeholder block. |
| \`.lu-skeleton--text\` | A line of text: one \`em\` high, with a smaller radius. |
| \`.lu-skeleton--circle\` | A round avatar or icon, a control high and wide. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div role="status" aria-label="Loading…" aria-busy="true" style="display:flex;gap:0.75rem;align-items:flex-start;max-inline-size:24rem">
      <span class="lu-skeleton lu-skeleton--circle" aria-hidden="true"></span>
      <div style="display:grid;flex:1;gap:0.5rem">
        <span class="lu-skeleton lu-skeleton--text" style="inline-size:40%" aria-hidden="true"></span>
        <span class="lu-skeleton lu-skeleton--text" aria-hidden="true"></span>
        <span class="lu-skeleton lu-skeleton--text" style="inline-size:80%" aria-hidden="true"></span>
        <span class="lu-skeleton" style="inline-size:6rem" aria-hidden="true"></span>
      </div>
    </div>
  `,
}
