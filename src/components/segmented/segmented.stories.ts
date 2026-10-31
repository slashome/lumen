import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Form/Segmented',
  component: 'lu-segmented',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`<lu-segmented label="Size" .values=${['XS', 'S', 'M', 'L', 'XL']} value="M"></lu-segmented>`,
  play: async ({ canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector('lu-segmented')
    const group = inShadow(host, '[part="group"]')
    const button = (value: string) => [...group.querySelectorAll('button')].find((entry) => entry.textContent?.trim() === value) as HTMLButtonElement
    const pressed = () => [...group.querySelectorAll('button[aria-pressed="true"]')].map((entry) => entry.textContent?.trim())
    const changes = recordEvents(canvasElement, 'lu-value-change')

    await expect(group).toHaveAccessibleName('Size')
    await expect(pressed()).toEqual(['M'])

    await step('Pressing another button moves the pressed state to it', async () => {
      await userEvent.click(button('L'))
      await expect(changes).toHaveBeenLastCalledWith({ value: 'L' })
      await waitFor(() => expect(pressed()).toEqual(['L']))
    })

    await step('Pressing the pressed button releases it', async () => {
      await userEvent.click(button('L'))
      await expect(changes).toHaveBeenLastCalledWith({ value: null })
      await waitFor(() => expect(pressed()).toEqual([]))
    })

    await step('Each button is focusable and Space or Enter presses it', async () => {
      await expect([...group.querySelectorAll('button')].map((entry) => entry.tabIndex)).toEqual([0, 0, 0, 0, 0])
      button('XS').focus()
      await userEvent.keyboard(' ')
      await expect(changes).toHaveBeenLastCalledWith({ value: 'XS' })
      button('S').focus()
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ value: 'S' })
      await waitFor(() => expect(pressed()).toEqual(['S']))
      await expect(changes).toHaveBeenCalledTimes(4)
    })
  },
}
