import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Form/Field',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A form control with its label, its hint and its error, stacked. The markup carries the accessibility, so keep every link:

- the label's \`for\` names the control's \`id\`;
- the control's \`aria-describedby\` lists the \`id\` of the hint and of the error, hint first;
- an invalid control takes \`aria-invalid="true"\`, which also turns its border to the danger color;
- a required control takes the native \`required\`; the asterisk is \`aria-hidden\`, since \`required\` already tells assistive technologies.

A group of checkboxes or radios is a \`<fieldset class="lu-field">\` named by its \`<legend class="lu-field__label">\`.

| Class | Use |
| --- | --- |
| \`.lu-field\` | The stack, on a \`<div>\`, or on a \`<fieldset>\` for a group. Its label fades when the control or the fieldset is \`disabled\`. |
| \`.lu-field__label\` | The \`<label for>\` of the control, or the \`<legend>\` of the fieldset. |
| \`.lu-field__required\` | The asterisk after a required label, with \`aria-hidden="true"\`. |
| \`.lu-field__choice\` | A \`<label>\` that lays a \`.lu-checkbox\` or a \`.lu-radio\` next to its text. |
| \`.lu-field__hint\` | A sentence that helps fill the control, under it. |
| \`.lu-field__error\` | What is wrong with the value, under the control. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div class="lu-field" style="max-inline-size:20rem">
      <label class="lu-field__label" for="field-default">Handle</label>
      <input class="lu-input" id="field-default" aria-describedby="field-default-hint" />
      <p class="lu-field__hint" id="field-default-hint">Lowercase letters and dashes, as in @ada-lovelace.</p>
    </div>
  `,
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Handle' })
    await expect(input).toHaveAccessibleDescription('Lowercase letters and dashes, as in @ada-lovelace.')
    await expect(input).not.toBeInvalid()
  },
}

export const Invalid: StoryObj = {
  render: () => html`
    <div class="lu-field" style="max-inline-size:20rem">
      <label class="lu-field__label" for="field-invalid">Handle<span class="lu-field__required" aria-hidden="true">*</span></label>
      <input class="lu-input" id="field-invalid" value="Ada Lovelace" required aria-invalid="true" aria-describedby="field-invalid-hint field-invalid-error" />
      <p class="lu-field__hint" id="field-invalid-hint">Lowercase letters and dashes.</p>
      <p class="lu-field__error" id="field-invalid-error">A handle has no spaces.</p>
    </div>
  `,
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Handle' })
    await expect(input).toBeRequired()
    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription('Lowercase letters and dashes. A handle has no spaces.')
  },
}

export const Disabled: StoryObj = {
  render: () => html`
    <div class="lu-field" style="max-inline-size:20rem">
      <label class="lu-field__label" for="field-disabled">Identifier</label>
      <input class="lu-input" id="field-disabled" value="T020" disabled aria-describedby="field-disabled-hint" />
      <p class="lu-field__hint" id="field-disabled-hint">Given by the tree, it cannot change.</p>
    </div>
  `,
}

export const Group: StoryObj = {
  render: () => html`
    <fieldset class="lu-field" aria-describedby="field-group-hint">
      <legend class="lu-field__label">Notify me of</legend>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" checked /> New comments</label>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" /> Status changes</label>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" disabled /> Releases</label>
      <p class="lu-field__hint" id="field-group-hint">Sent once a day.</p>
    </fieldset>
  `,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Notify me of' })).toHaveAccessibleDescription('Sent once a day.')
  },
}
