import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Form/Date input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A date, a date and time, or a time, on the native \`<input type="date">\`, \`type="datetime-local"\` or \`type="time"\`, at the control height and in the colors of the inputs. The calendar that opens, the keyboard, the order of day, month and year, and what screen readers say are the browser's, in the user's language: the open calendar cannot be styled. \`min\`, \`max\`, \`step\`, \`required\` and \`value\` (\`2026-10-31\`, \`2026-10-31T09:30\`, \`09:30\`) work as on any input.

Name it with a \`<label>\`, and put it in a \`.lu-field\` for its hint and its error.

| Class | Use |
| --- | --- |
| \`.lu-date-input\` | The \`<input type="date">\`, \`"datetime-local"\` or \`"time"\`. Disabled by \`disabled\`, invalid by \`aria-invalid="true"\`. Where the browser draws a picker button (Chrome, Edge), it takes the muted color of the theme, a calendar or a clock. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div class="lu-field" style="max-inline-size:20rem">
      <label class="lu-field__label" for="date-default">Due date</label>
      <input class="lu-date-input" type="date" id="date-default" value="2026-11-12" min="2026-10-31" aria-describedby="date-default-hint" />
      <p class="lu-field__hint" id="date-default-hint">From today on.</p>
    </div>
  `,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText<HTMLInputElement>('Due date')
    await expect(input).toHaveAccessibleDescription('From today on.')
    await expect(input.type).toBe('date')
    await expect(input.valueAsDate?.toISOString().slice(0, 10)).toBe('2026-11-12')
    await expect(input).not.toBeInvalid()
  },
}

export const Types: StoryObj = {
  parameters: {
    docs: { description: { story: 'The same class on the three types: a date, a date and time, a time.' } },
  },
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <div class="lu-field">
        <label class="lu-field__label" for="date-types-date">Release</label>
        <input class="lu-date-input" type="date" id="date-types-date" value="2026-12-01" />
      </div>
      <div class="lu-field">
        <label class="lu-field__label" for="date-types-datetime">Meeting</label>
        <input class="lu-date-input" type="datetime-local" id="date-types-datetime" value="2026-11-04T14:30" />
      </div>
      <div class="lu-field">
        <label class="lu-field__label" for="date-types-time">Daily reminder</label>
        <input class="lu-date-input" type="time" id="date-types-time" value="09:30" step="900" />
      </div>
    </div>
  `,
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText<HTMLInputElement>('Meeting').value).toBe('2026-11-04T14:30')
    await expect(canvas.getByLabelText<HTMLInputElement>('Daily reminder').value).toBe('09:30')
  },
}

export const Invalid: StoryObj = {
  render: () => html`
    <div class="lu-field" style="max-inline-size:20rem">
      <label class="lu-field__label" for="date-invalid">Due date<span class="lu-field__required" aria-hidden="true">*</span></label>
      <input
        class="lu-date-input"
        type="date"
        id="date-invalid"
        value="2026-10-01"
        min="2026-10-31"
        required
        aria-invalid="true"
        aria-describedby="date-invalid-hint date-invalid-error"
      />
      <p class="lu-field__hint" id="date-invalid-hint">From today on.</p>
      <p class="lu-field__error" id="date-invalid-error">This date has passed.</p>
    </div>
  `,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText<HTMLInputElement>(/^Due date/)
    await expect(input).toBeRequired()
    await expect(input).toBeInvalid()
    await expect(input.validity.rangeUnderflow).toBe(true)
    await expect(input).toHaveAccessibleDescription('From today on. This date has passed.')
  },
}

export const Disabled: StoryObj = {
  render: () => html`
    <div class="lu-field" style="max-inline-size:20rem">
      <label class="lu-field__label" for="date-disabled">Created</label>
      <input class="lu-date-input" type="date" id="date-disabled" value="2026-10-31" disabled />
    </div>
  `,
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Created')).toBeDisabled()
  },
}
