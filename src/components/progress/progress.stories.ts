import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Feedback/Progress',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A progress bar on the native \`<progress>\`, which gives assistive technologies the \`progressbar\` role and its value. With \`value\` and \`max\` it is determinate and fills with the primary color; without \`value\` it is indeterminate and a segment sweeps across it, standing still under \`prefers-reduced-motion\`. Name it with a \`<label for>\` or \`aria-label\`.

| Class | Use |
| --- | --- |
| \`.lu-progress\` | The bar, on a \`<progress>\`. |`,
      },
    },
  },
}
export default meta

export const Determinate: StoryObj = {
  render: () => html`
    <div class="lu-field" style="max-inline-size:24rem">
      <label class="lu-field__label" for="progress-import">Importing items</label>
      <progress class="lu-progress" id="progress-import" value="7" max="12">7 of 12</progress>
    </div>
  `,
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Importing items' })
    await expect(bar).toHaveAttribute('value', '7')
  },
}

export const Indeterminate: StoryObj = {
  render: () => html`
    <div style="max-inline-size:24rem">
      <progress class="lu-progress" aria-label="Reading the repository"></progress>
    </div>
  `,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Reading the repository' })).not.toHaveAttribute('value')
  },
}
