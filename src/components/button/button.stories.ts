import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Actions/Button',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `A button on the native \`<button>\`, or a link styled as one. It lights up when clicked once \`attachLight()\` runs. Disabled by \`disabled\` or \`aria-disabled="true"\`.

| Class | Use |
| --- | --- |
| \`.lu-button\` | The button, on the primary fill: the one main action of a view. |
| \`.lu-button--outline\` | Variant: a bordered button on the page fill, for secondary actions. |
| \`.lu-button--ghost\` | Variant: no fill until hovered, for actions inside dense content. |
| \`.lu-button--destructive\` | Variant: the danger fill, for an action that deletes or cannot be undone. |
| \`.lu-button--sm\` | Size: the small control height. |
| \`.lu-button--icon\` | Shape: a square button of the small control height that holds only an icon; give it an \`aria-label\`. |
| \`.lu-icon-button\` | A borderless round button with a halo on hover, for an icon inside other content, such as a close button. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
      <button class="lu-button">Default</button>
      <button class="lu-button lu-button--outline">Outline</button>
      <button class="lu-button lu-button--ghost">Ghost</button>
      <button class="lu-button lu-button--destructive">Delete</button>
      <button class="lu-button lu-button--sm">Small</button>
      <button class="lu-button lu-button--outline lu-button--icon" aria-label="Add"><lu-icon name="add"></lu-icon></button>
      <button class="lu-icon-button" aria-label="Copy"><lu-icon name="copy"></lu-icon></button>
      <button class="lu-button" disabled>Disabled</button>
    </div>
  `,
}
