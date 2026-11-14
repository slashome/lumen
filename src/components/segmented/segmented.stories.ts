import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Form/Segmented',
  component: 'lu-segmented',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/segmented'" } },
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
      await expect(changes).toHaveBeenLastCalledWith({ value: 'L', source: 'option' })
      await waitFor(() => expect(pressed()).toEqual(['L']))
    })

    await step('Pressing the pressed button releases it', async () => {
      await userEvent.click(button('L'))
      await expect(changes).toHaveBeenLastCalledWith({ value: null, source: 'option' })
      await waitFor(() => expect(pressed()).toEqual([]))
    })

    await step('Each button is focusable and Space or Enter presses it', async () => {
      await expect([...group.querySelectorAll('button')].map((entry) => entry.tabIndex)).toEqual([0, 0, 0, 0, 0])
      button('XS').focus()
      await userEvent.keyboard(' ')
      await expect(changes).toHaveBeenLastCalledWith({ value: 'XS', source: 'option' })
      button('S').focus()
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ value: 'S', source: 'option' })
      await waitFor(() => expect(pressed()).toEqual(['S']))
      await expect(changes).toHaveBeenCalledTimes(4)
    })
  },
}

export const Skip_tab: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'With `skip-tab`, the buttons stay clickable but Tab passes over them, for a row the page reaches with its own keys.',
      },
    },
  },
  render: () => html`
    <button class="lu-button lu-button--outline">Before</button>
    <lu-segmented label="Priority" .values=${['low', 'medium', 'high']} value="medium" skip-tab></lu-segmented>
    <button class="lu-button lu-button--outline">After</button>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const group = inShadow(canvasElement.querySelector('lu-segmented'), '[part="group"]')

    await step('Tab goes from the button before to the button after', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Before' }))
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: 'After' })).toHaveFocus()
    })

    await step('A click still presses a button', async () => {
      const high = [...group.querySelectorAll('button')].find((entry) => entry.textContent?.trim() === 'high') as HTMLButtonElement
      await userEvent.click(high)
      await waitFor(() => expect(high).toHaveAttribute('aria-pressed', 'true'))
    })
  },
}
