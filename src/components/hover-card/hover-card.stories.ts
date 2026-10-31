import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import type { OpenChangeDetail } from '../../lib/change'
import type { LumenHoverCard } from './hover-card'
import { inShadow, isOpen, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Hover card',
  component: 'lu-hover-card',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/hover-card'" } },
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
    const openChanges = recordEvents(canvasElement, 'lu-open-change')

    await step('Focus opens the card by itself after its delay, Escape closes it', async () => {
      await userEvent.tab()
      await expect(trigger).toHaveFocus()
      await expect(isOpen(card)).toBe(false)
      await waitFor(() => expect(isOpen(card)).toBe(true))
      await expect(openChanges).toHaveBeenLastCalledWith({ open: true, source: 'trigger' })
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(isOpen(card)).toBe(false))
      await expect(openChanges).toHaveBeenLastCalledWith({ open: false, source: 'escape' })
    })

    await step('The card stays open while the pointer is on it, and closes after its delay once the pointer leaves', async () => {
      await userEvent.tab({ shift: true })
      await userEvent.tab()
      await waitFor(() => expect(isOpen(card)).toBe(true))
      await userEvent.hover(card)
      await userEvent.unhover(card)
      await expect(isOpen(card)).toBe(true)
      await waitFor(() => expect(isOpen(card)).toBe(false))
      await expect(openChanges).toHaveBeenLastCalledWith({ open: false, source: 'panel' })
    })
  },
}

function holdOpen(event: CustomEvent<OpenChangeDetail>) {
  event.preventDefault()
  const card = event.currentTarget as LumenHoverCard
  const hold = card.closest('div')?.querySelector<HTMLInputElement>('input[name="hold"]')
  if (!hold?.checked) {
    card.open = event.detail.open
  }
}

export const Controlled: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'The owner cancels every `lu-open-change` and sets `open` from `detail.open` unless the box is checked: then the card keeps the state it had.',
      },
    },
  },
  render: () => html`
    <div style="display:flex;gap:1rem;align-items:center">
      <lu-hover-card open-delay="100" close-delay="100" placement="bottom-start" @lu-open-change=${holdOpen}>
        <button slot="trigger" class="lu-button lu-button--outline">Controlled</button>
        <p style="margin:0">Held by its owner.</p>
      </lu-hover-card>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" name="hold" /> Hold it</label>
    </div>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector<LumenHoverCard>('lu-hover-card')
    const card = inShadow(host, '[part="card"]')
    const trigger = canvas.getByRole('button', { name: 'Controlled' })
    const hold = canvas.getByRole('checkbox', { name: 'Hold it' })

    await step('The owner sets open from the event: focus opens it', async () => {
      trigger.focus()
      await waitFor(() => expect(isOpen(card)).toBe(true))
      await expect(host?.open).toBe(true)
    })

    await step('While the owner holds it, neither Escape nor leaving closes it', async () => {
      await userEvent.click(hold)
      trigger.focus()
      await userEvent.keyboard('{Escape}')
      await userEvent.tab()
      await new Promise((resolve) => setTimeout(resolve, 200))
      await expect(host?.open).toBe(true)
      await expect(isOpen(card)).toBe(true)
    })

    await step('The owner closes it by clearing open', async () => {
      if (host) {
        host.open = false
      }
      await waitFor(() => expect(isOpen(card)).toBe(false))
    })
  },
}
