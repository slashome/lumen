import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, isOpen } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Hover card',
  component: 'lu-hover-card',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-hover-card open-delay="100" placement="bottom-start">
      <button slot="trigger" class="lu-button lu-button--outline">3 uncommitted changes</button>
      <p style="margin:0">Commit everything, commit per node, or push.</p>
    </lu-hover-card>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const card = inShadow(canvasElement.querySelector('lu-hover-card'), '[part="card"]')
    const trigger = canvas.getByRole('button', { name: '3 uncommitted changes' })

    await step('Focus opens the card after its delay, Escape closes it', async () => {
      await userEvent.tab()
      await expect(trigger).toHaveFocus()
      await expect(isOpen(card)).toBe(false)
      await waitFor(() => expect(isOpen(card)).toBe(true))
      await userEvent.keyboard('{Escape}')
      await expect(isOpen(card)).toBe(false)
    })

    await step('The card stays open while the pointer is on it, and closes after its delay once the pointer leaves', async () => {
      await userEvent.tab({ shift: true })
      await userEvent.tab()
      await waitFor(() => expect(isOpen(card)).toBe(true))
      await userEvent.hover(card)
      await userEvent.unhover(card)
      await expect(isOpen(card)).toBe(true)
      await waitFor(() => expect(isOpen(card)).toBe(false))
    })
  },
}
