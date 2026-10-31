import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, isOpen } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Tooltip',
  component: 'lu-tooltip',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/tooltip'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-tooltip content="~/workspace/projects/slashome/_ariane">
      <button class="lu-button lu-button--outline">Content repository</button>
    </lu-tooltip>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const panel = inShadow(canvasElement.querySelector('lu-tooltip'), '[role="tooltip"]')
    const trigger = canvas.getByRole('button', { name: 'Content repository' })
    await expect(trigger).toHaveAttribute('aria-description', '~/workspace/projects/slashome/_ariane')

    await step('Focus shows the tooltip after its delay, Escape hides it', async () => {
      await userEvent.tab()
      await expect(trigger).toHaveFocus()
      await expect(isOpen(panel)).toBe(false)
      await waitFor(() => expect(isOpen(panel)).toBe(true))
      await userEvent.keyboard('{Escape}')
      await expect(isOpen(panel)).toBe(false)
      await expect(trigger).toHaveFocus()
    })

    await step('Leaving the trigger hides the tooltip', async () => {
      await userEvent.tab({ shift: true })
      await userEvent.tab()
      await waitFor(() => expect(isOpen(panel)).toBe(true))
      await userEvent.tab()
      await expect(isOpen(panel)).toBe(false)
    })

    await step('Hovering the trigger shows the tooltip, leaving hides it', async () => {
      await userEvent.hover(trigger)
      await waitFor(() => expect(isOpen(panel)).toBe(true))
      await userEvent.unhover(trigger)
      await expect(isOpen(panel)).toBe(false)
    })
  },
}
