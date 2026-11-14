import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Actions/Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A button on the native \`<button>\`, or a link styled as one. It lights up when clicked once \`attachLight()\` runs. Disabled by \`disabled\` or \`aria-disabled="true"\`. Loading with \`aria-busy="true"\` and \`aria-disabled="true"\`: a spinner in the text color precedes the label and the button keeps its focus; the application ignores its clicks. \`LuButton\`, in React and in Vue, draws an \`<a>\` given \`href\`, and sets both attributes and blocks the click given \`loading\`.

| Class | Use |
| --- | --- |
| \`.lu-button\` | The button, on the primary fill: the one main action of a view. |
| \`.lu-button--outline\` | Variant: a bordered button on the page fill, for secondary actions. |
| \`.lu-button--ghost\` | Variant: no fill until hovered, for actions inside dense content. |
| \`.lu-button--danger\` | Variant: the danger fill, for an action that deletes or cannot be undone. |
| \`.lu-button--destructive\` | **Deprecated**: use \`.lu-button--danger\`, which draws the same. Removed in the next major version. |
| \`.lu-button--sm\` | Size: the small control height. |
| \`.lu-button--icon\` | Shape: a square button of the small control height that holds only an icon; give it an \`aria-label\`. |
| \`[aria-busy="true"]\` | State: loading, with a spinner and the progress cursor. Set \`aria-disabled="true"\` with it, not \`disabled\`, so the focus stays. |
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
      <button class="lu-button lu-button--danger">Delete</button>
      <button class="lu-button lu-button--sm">Small</button>
      <button class="lu-button lu-button--outline lu-button--icon" aria-label="Add"><lu-icon name="add"></lu-icon></button>
      <button class="lu-icon-button" aria-label="Copy"><lu-icon name="copy"></lu-icon></button>
      <button class="lu-button" disabled>Disabled</button>
    </div>
  `,
}

export const Link: StoryObj = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
      <a class="lu-button" href="#docs">Read the docs</a>
      <a class="lu-button lu-button--outline" href="#docs">Outline link</a>
      <a class="lu-button lu-button--ghost lu-button--sm" href="#docs">Small ghost link</a>
      <button class="lu-button" type="button">Button beside it</button>
    </div>
  `,
}

export const Loading: StoryObj = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
      <button class="lu-button" type="submit" aria-busy="true" aria-disabled="true">Saving</button>
      <button class="lu-button lu-button--outline" type="button" aria-busy="true" aria-disabled="true">Loading</button>
      <button class="lu-button lu-button--danger lu-button--sm" type="button" aria-busy="true" aria-disabled="true">Deleting</button>
      <a class="lu-button lu-button--ghost" href="#export" aria-busy="true" aria-disabled="true">Exporting</a>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const busy = [...canvasElement.querySelectorAll<HTMLElement>('.lu-button[aria-busy="true"]')]
    await step('a loading button keeps its focus and shows the progress cursor', async () => {
      for (const element of busy) {
        element.focus()
        await expect(element).toHaveFocus()
        await expect(getComputedStyle(element).cursor).toBe('progress')
        await expect(getComputedStyle(element, '::before').content).not.toBe('none')
      }
    })
  },
}
