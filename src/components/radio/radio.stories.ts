import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Form/Radio',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A radio button on the native \`<input type="radio">\`. Radios that share a \`name\` form one group: the browser keeps one checked and moves through them with the arrow keys. Put the group in a \`<fieldset class="lu-field">\` named by its \`<legend>\`, and each radio in a \`.lu-field__choice\` label.

| Class | Use |
| --- | --- |
| \`.lu-radio\` | The round button. Disabled by \`disabled\`, invalid by \`aria-invalid="true"\`. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <fieldset class="lu-field">
      <legend class="lu-field__label">Size</legend>
      <label class="lu-field__choice"><input type="radio" class="lu-radio" name="radio-size" value="s" /> Small</label>
      <label class="lu-field__choice"><input type="radio" class="lu-radio" name="radio-size" value="m" checked /> Medium</label>
      <label class="lu-field__choice"><input type="radio" class="lu-radio" name="radio-size" value="l" /> Large</label>
      <label class="lu-field__choice"><input type="radio" class="lu-radio" name="radio-size" value="xl" disabled /> Extra large</label>
    </fieldset>
  `,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Large'))
    await expect(canvas.getByRole('radio', { name: 'Large' })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: 'Medium' })).not.toBeChecked()
  },
}

export const Invalid: StoryObj = {
  render: () => html`
    <fieldset class="lu-field" aria-describedby="radio-invalid-error">
      <legend class="lu-field__label">Answer<span class="lu-field__required" aria-hidden="true">*</span></legend>
      <label class="lu-field__choice"><input type="radio" class="lu-radio" name="radio-answer" required aria-invalid="true" /> Yes</label>
      <label class="lu-field__choice"><input type="radio" class="lu-radio" name="radio-answer" required aria-invalid="true" /> No</label>
      <p class="lu-field__error" id="radio-invalid-error">Pick an answer.</p>
    </fieldset>
  `,
}
