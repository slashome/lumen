import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Form/Radio card',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `A radio as a card, for choices that need a sentence each. The card is a \`<label>\` that wraps a native \`.lu-radio\`, so a click anywhere on it checks the radio, and the browser handles the group, the arrow keys and the form value. The card draws the checked, focused, invalid and disabled states of its radio. Put the cards in a \`<fieldset class="lu-field">\`.

| Class | Use |
| --- | --- |
| \`.lu-radio-card\` | The \`<label>\`, around an \`<input type="radio" class="lu-radio">\` and its body. |
| \`.lu-radio-card__body\` | The text next to the radio. |
| \`.lu-radio-card__label\` | The name of the choice. |
| \`.lu-radio-card__description\` | The sentence under the name. |`,
      },
    },
  },
}
export default meta

const card = (value: string, label: string, description: string, { checked = false, disabled = false } = {}) => html`
  <label class="lu-radio-card">
    <input type="radio" class="lu-radio" name="radio-card-visibility" value=${value} ?checked=${checked} ?disabled=${disabled} />
    <span class="lu-radio-card__body">
      <span class="lu-radio-card__label">${label}</span>
      <span class="lu-radio-card__description">${description}</span>
    </span>
  </label>
`

export const Default: StoryObj = {
  render: () => html`
    <fieldset class="lu-field" style="max-inline-size:24rem">
      <legend class="lu-field__label">Visibility</legend>
      ${card('private', 'Private', 'Only you can see the project.', { checked: true })}
      ${card('team', 'Team', 'Everyone in the team can see and edit it.')}
      ${card('public', 'Public', 'Anyone with the link can read it.', { disabled: true })}
    </fieldset>
  `,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Everyone in the team can see and edit it.'))
    await expect(canvas.getByRole('radio', { name: /^Team/ })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: /^Private/ })).not.toBeChecked()
  },
}
