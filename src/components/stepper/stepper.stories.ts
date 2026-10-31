import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Navigation/Stepper',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `Where the user stands in a sequence of steps. An ordered list where the current step carries \`aria-current="step"\`; the application knows which step is current and moves the attribute, the class holds no state. Steps before the current one are drawn done, with a check; the current one with a filled marker, a ring and a heavier label; the next ones with their number in an outlined marker. The three differ by shape and weight, not only by color.

A done step the user may go back to holds a link; the class underlines it. The number and the check are drawn by the CSS: where the browser supports alternative text for generated content, screen readers do not read the number, elsewhere they read it before the label. Lumen says nothing of a step being done: when it matters, put the words in the label, in a \`.lu-visually-hidden\` span. Wrap the list in a \`<nav>\` named by \`aria-label\` when its steps are links.

| Class | Use |
| --- | --- |
| \`.lu-stepper\` | The \`<ol>\`, its steps in a row; each step takes an equal share and a line joins it to the next. |
| \`.lu-stepper--vertical\` | Stacks the steps, for a side column or a narrow screen. |
| \`.lu-stepper__step\` | Each \`<li>\`; the current one takes \`aria-current="step"\`. |
| \`.lu-stepper__label\` | The \`<a href>\` of a step the user can go back to, or the \`<span>\` of the others. Long labels are cut with an ellipsis. |`,
      },
    },
  },
}
export default meta

const marker = (step: Element) => getComputedStyle(step, '::before')

export const Default: StoryObj = {
  render: () => html`
    <nav aria-label="Project setup">
      <ol class="lu-stepper">
        <li class="lu-stepper__step"><a class="lu-stepper__label" href="#account">Account<span class="lu-visually-hidden"> (done)</span></a></li>
        <li class="lu-stepper__step"><a class="lu-stepper__label" href="#repository">Repository<span class="lu-visually-hidden"> (done)</span></a></li>
        <li class="lu-stepper__step" aria-current="step"><span class="lu-stepper__label">Team</span></li>
        <li class="lu-stepper__step"><span class="lu-stepper__label">Billing</span></li>
      </ol>
    </nav>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const steps = [...canvasElement.querySelectorAll('.lu-stepper__step')]
    const [account, repository, team, billing] = steps as [Element, Element, Element, Element]

    await step('The list is an ordered list of four steps, the third one current', async () => {
      await expect(canvas.getByRole('navigation', { name: 'Project setup' })).toBeVisible()
      await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
      await expect(steps.filter((entry) => entry.getAttribute('aria-current') === 'step')).toEqual([team])
    })

    await step('Done, current and next steps differ by more than color', async () => {
      await expect(marker(account).maskImage).not.toBe('none')
      await expect(marker(repository).maskImage).not.toBe('none')
      await expect(marker(team).maskImage).toBe('none')
      await expect(marker(team).outlineStyle).toBe('solid')
      await expect(marker(billing).outlineStyle).toBe('none')
      await expect(Number(getComputedStyle(team).fontWeight)).toBeGreaterThan(Number(getComputedStyle(billing).fontWeight))
    })

    await step('The done steps are links reached with Tab; the others are not', async () => {
      await expect(canvas.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['#account', '#repository'])
      await userEvent.tab()
      await expect(canvas.getByRole('link', { name: 'Account (done)' })).toHaveFocus()
      await userEvent.tab()
      await expect(canvas.getByRole('link', { name: 'Repository (done)' })).toHaveFocus()
    })
  },
}

export const Vertical: StoryObj = {
  render: () => html`
    <ol class="lu-stepper lu-stepper--vertical" aria-label="Release">
      <li class="lu-stepper__step"><span class="lu-stepper__label">Freeze develop</span></li>
      <li class="lu-stepper__step" aria-current="step"><span class="lu-stepper__label">Write the changelog</span></li>
      <li class="lu-stepper__step"><span class="lu-stepper__label">Tag on main</span></li>
    </ol>
  `,
  play: async ({ canvas }) => {
    const [freeze, changelog, tag] = canvas.getAllByRole('listitem')
    await expect(changelog).toHaveAttribute('aria-current', 'step')
    await expect(freeze!.getBoundingClientRect().top).toBeLessThan(changelog!.getBoundingClientRect().top)
    await expect(changelog!.getBoundingClientRect().top).toBeLessThan(tag!.getBoundingClientRect().top)
  },
}
