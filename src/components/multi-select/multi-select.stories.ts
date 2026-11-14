import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, isOpen, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Form/Multi-select',
  component: 'lu-multi-select',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/multi-select'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-multi-select
      label="Kind"
      .options=${[
        { value: 'task', label: 'Task' },
        { value: 'story', label: 'Story' },
        { value: 'epic', label: 'Epic' },
      ]}
      .selected=${['task']}
    ></lu-multi-select>
  `,
  play: async ({ canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector('lu-multi-select')
    const trigger = inShadow(host, '[part="trigger"]')
    const menu = inShadow(host, '[part="menu"]')
    const item = (label: string) => [...menu.querySelectorAll<HTMLElement>('.item')].find((entry) => entry.textContent?.trim() === label)
    const focused = () => host?.shadowRoot?.activeElement
    const changes = recordEvents(canvasElement, 'lu-selected-change')

    await expect(trigger).toHaveTextContent('Kind 1')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await step('A click opens the menu on its first item', async () => {
      await userEvent.click(trigger)
      await expect(isOpen(menu)).toBe(true)
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
      await expect(menu).toHaveAccessibleName('Kind')
      await expect(focused()).toBe(item('Task'))
      await expect(item('Task')).toHaveAttribute('aria-checked', 'true')
    })

    await step('The arrow keys move between items, Enter toggles one and keeps the menu open', async () => {
      await userEvent.keyboard('{ArrowDown}')
      await expect(focused()).toBe(item('Story'))
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ selected: ['task', 'story'], source: 'option' })
      await waitFor(() => expect(item('Story')).toHaveAttribute('aria-checked', 'true'))
      await expect(trigger).toHaveTextContent('Kind 2')
      await expect(isOpen(menu)).toBe(true)
      await userEvent.click(item('Task') as HTMLElement)
      await expect(changes).toHaveBeenLastCalledWith({ selected: ['story'], source: 'option' })
      await waitFor(() => expect(item('Task')).toHaveAttribute('aria-checked', 'false'))
    })

    await step('Clear empties the selection, closes the menu and gives the focus back', async () => {
      await userEvent.keyboard('{End}')
      await expect(focused()).toBe(item('Clear'))
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ selected: [], source: 'clear' })
      await expect(isOpen(menu)).toBe(false)
      await expect(focused()).toBe(trigger)
      await waitFor(() => expect(trigger).toHaveTextContent(/^\s*Kind\s*$/))
      await expect(item('Clear')).toBeUndefined()
    })

    await step('ArrowDown on the button opens the menu, Tab closes it', async () => {
      await userEvent.keyboard('{ArrowDown}')
      await expect(isOpen(menu)).toBe(true)
      await expect(focused()).toBe(item('Task'))
      await userEvent.keyboard('{Tab}')
      await expect(isOpen(menu)).toBe(false)
      await expect(changes).toHaveBeenCalledTimes(3)
    })
  },
}
