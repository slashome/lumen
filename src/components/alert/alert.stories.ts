import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Feedback/Alert',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A message about a region or a page that stays in place, unlike a toast. The status modifier tints it and colors its icon; the text stays in the foreground color, so it reads on every tint.

**\`role="status"\` or \`role="alert"\`.** Both are live regions: a screen reader announces what is written into them after the page has loaded, not what they held when they appeared with the page.

- **\`role="status"\`** waits for the reader to finish: the outcome of an action the user can read in their own time, as "Saved" or "3 items imported". Use it for info, success and most warnings.
- **\`role="alert"\`** interrupts: an error that stops the task, or a warning the user must act on now. Use it sparingly; two alerts in a row cut each other off.
- **Neither** for a message that is part of the page from the start, such as a notice at the top of a settings page: it is read with the rest of the content.

Keep the live region in the page and change its content, rather than inserting a new alert: some screen readers ignore a live region added at the same time as its text.

| Class | Use |
| --- | --- |
| \`.lu-alert\` | The message box, neutral without a status. |
| \`.lu-alert--info\`, \`.lu-alert--success\`, \`.lu-alert--warning\`, \`.lu-alert--danger\` | The status, with the \`info\`, \`success\`, \`warning\` and \`danger\` tokens. |
| \`.lu-alert__icon\` | The \`<lu-icon>\` before the text: \`info\`, \`success\`, \`warning\` or \`error\`. |
| \`.lu-alert__body\` | The text column. |
| \`.lu-alert__title\` | The first line, in medium weight. |
| \`.lu-alert__description\` | The sentence under the title. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:32rem">
      <div class="lu-alert">
        <div class="lu-alert__body"><p class="lu-alert__description">The tree is read from the content repository.</p></div>
      </div>
      <div class="lu-alert lu-alert--info">
        <lu-icon class="lu-alert__icon" name="info"></lu-icon>
        <div class="lu-alert__body">
          <p class="lu-alert__title">Read only</p>
          <p class="lu-alert__description">This node is archived; reopen it to edit its items.</p>
        </div>
      </div>
      <div class="lu-alert lu-alert--success">
        <lu-icon class="lu-alert__icon" name="success"></lu-icon>
        <div class="lu-alert__body"><p class="lu-alert__title">Twelve tasks imported</p></div>
      </div>
      <div class="lu-alert lu-alert--warning">
        <lu-icon class="lu-alert__icon" name="warning"></lu-icon>
        <div class="lu-alert__body">
          <p class="lu-alert__title">Unsaved changes</p>
          <p class="lu-alert__description">Two items changed on disk since you opened them.</p>
        </div>
      </div>
      <div class="lu-alert lu-alert--danger">
        <lu-icon class="lu-alert__icon" name="error"></lu-icon>
        <div class="lu-alert__body">
          <p class="lu-alert__title">The content repository could not be read</p>
          <p class="lu-alert__description">Check that the path exists, then reload.</p>
        </div>
      </div>
    </div>
  `,
}

function save(event: Event) {
  const region = (event.currentTarget as Element).closest('[data-demo]')?.querySelector('[role="status"]')
  region?.replaceChildren(Object.assign(document.createElement('p'), { className: 'lu-alert__title', textContent: 'Saved' }))
  region?.classList.add('lu-alert', 'lu-alert--success')
}

function remove(event: Event) {
  const region = (event.currentTarget as Element).closest('[data-demo]')?.querySelector('[role="alert"]')
  region?.replaceChildren(Object.assign(document.createElement('p'), { className: 'lu-alert__title', textContent: 'The item is locked by another session' }))
  region?.classList.add('lu-alert', 'lu-alert--danger')
}

export const LiveRegions: StoryObj = {
  render: () => html`
    <div data-demo style="display:grid;gap:0.75rem;max-inline-size:32rem">
      <div style="display:flex;gap:0.5rem">
        <button class="lu-button lu-button--outline" @click=${save}>Save</button>
        <button class="lu-button lu-button--destructive" @click=${remove}>Delete</button>
      </div>
      <div role="status"></div>
      <div role="alert"></div>
    </div>
  `,
  play: async ({ canvas, userEvent, step }) => {
    await step('A success is written into the status region, which waits its turn', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
      await expect(canvas.getByRole('status')).toHaveTextContent('Saved')
      await expect(canvas.getByRole('status')).toHaveClass('lu-alert--success')
    })
    await step('An error that stops the task is written into the alert region, which interrupts', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete' }))
      await expect(canvas.getByRole('alert')).toHaveTextContent('The item is locked by another session')
      await expect(canvas.getByRole('alert')).toHaveClass('lu-alert--danger')
    })
  },
}
