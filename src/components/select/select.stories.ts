import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import type { LumenSelect } from './select'
import { inShadow, isOpen, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Form/Select',
  component: 'lu-select',
  subcomponents: { 'lu-option': 'lu-option' },
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-select label="Status" value="todo" style="inline-size:14rem">
      <lu-option value="backlog">backlog</lu-option>
      <lu-option value="todo">todo</lu-option>
      <lu-option value="in_progress">in progress</lu-option>
      <lu-option value="done">done</lu-option>
      <lu-option value="dropped" disabled>dropped</lu-option>
    </lu-select>
  `,
  play: async ({ canvasElement, userEvent, step }) => {
    const select = canvasElement.querySelector<LumenSelect>('lu-select')
    const trigger = inShadow(select, '[part="trigger"]')
    const listbox = inShadow(select, '[part="listbox"]')
    const option = (value: string) => select?.querySelector<HTMLElement>(`lu-option[value="${value}"]`)
    const changes = recordEvents(canvasElement, 'lu-value-change')

    await expect(trigger).toHaveAccessibleName('Status')
    await expect(trigger).toHaveTextContent('todo')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await step('A click opens the list on the selected option', async () => {
      await userEvent.click(trigger)
      await expect(isOpen(listbox)).toBe(true)
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
      await expect(option('todo')).toHaveFocus()
      await expect(option('todo')).toHaveAttribute('aria-selected', 'true')
    })

    await step('The arrow keys skip the disabled option, Enter picks, closes and gives the focus back', async () => {
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
      await expect(option('done')).toHaveFocus()
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenCalledOnce()
      await expect(changes).toHaveBeenCalledWith({ value: 'done' })
      await expect(select?.value).toBe('done')
      await expect(isOpen(listbox)).toBe(false)
      await expect(select?.shadowRoot?.activeElement).toBe(trigger)
      await waitFor(() => expect(trigger).toHaveTextContent('done'))
    })

    await step('The keyboard opens the list, typeahead moves to a match, Home and End reach the ends', async () => {
      await userEvent.keyboard('{ArrowDown}')
      await expect(isOpen(listbox)).toBe(true)
      await expect(option('done')).toHaveFocus()
      await userEvent.keyboard('{Home}')
      await expect(option('backlog')).toHaveFocus()
      await userEvent.keyboard('{End}')
      await expect(option('done')).toHaveFocus()
      await userEvent.keyboard('i')
      await expect(option('in_progress')).toHaveFocus()
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ value: 'in_progress' })
      await expect(isOpen(listbox)).toBe(false)
    })

    await step('Tab closes the list', async () => {
      await userEvent.click(trigger)
      await expect(option('in_progress')).toHaveFocus()
      await userEvent.keyboard('{Tab}')
      await expect(isOpen(listbox)).toBe(false)
    })

    await step('Picking a disabled option or the current one fires nothing', async () => {
      await userEvent.click(trigger)
      await userEvent.click(option('dropped') as HTMLElement)
      await expect(isOpen(listbox)).toBe(true)
      await userEvent.click(option('in_progress') as HTMLElement)
      await expect(isOpen(listbox)).toBe(false)
      await expect(changes).toHaveBeenCalledTimes(2)
      await expect(select?.value).toBe('in_progress')
    })
  },
}
