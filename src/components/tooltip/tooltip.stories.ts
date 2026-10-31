import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import type { OpenChangeDetail } from '../../lib/change'
import type { LumenTooltip } from './tooltip'
import { isOpen, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Overlays/Tooltip',
  component: 'lu-tooltip',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/tooltip'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <button id="content-repository" class="lu-button lu-button--outline">Content repository</button>
    <lu-tooltip for="content-repository">~/workspace/projects/slashome/_ariane</lu-tooltip>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const panel = canvasElement.querySelector<LumenTooltip>('lu-tooltip')!
    const trigger = canvas.getByRole('button', { name: 'Content repository' })
    const openChanges = recordEvents(canvasElement, 'lu-open-change')
    await expect(trigger).toHaveAttribute('aria-describedby', panel.id)
    await expect(trigger).toHaveAccessibleDescription('~/workspace/projects/slashome/_ariane')

    await step('Focus shows the tooltip by itself after its delay, Escape hides it', async () => {
      await userEvent.tab()
      await expect(trigger).toHaveFocus()
      await expect(isOpen(panel)).toBe(false)
      await waitFor(() => expect(isOpen(panel)).toBe(true))
      await expect(openChanges).toHaveBeenLastCalledWith({ open: true, source: 'trigger' })
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(isOpen(panel)).toBe(false))
      await expect(openChanges).toHaveBeenLastCalledWith({ open: false, source: 'escape' })
      await expect(trigger).toHaveFocus()
    })

    await step('Leaving the trigger hides the tooltip', async () => {
      await userEvent.tab({ shift: true })
      await userEvent.tab()
      await waitFor(() => expect(isOpen(panel)).toBe(true))
      await userEvent.tab()
      await waitFor(() => expect(isOpen(panel)).toBe(false))
    })

    await step('Hovering the trigger shows the tooltip, leaving hides it', async () => {
      await userEvent.hover(trigger)
      await waitFor(() => expect(isOpen(panel)).toBe(true))
      await userEvent.unhover(trigger)
      await waitFor(() => expect(isOpen(panel)).toBe(false))
    })
  },
}

function holdOpen(event: CustomEvent<OpenChangeDetail>) {
  event.preventDefault()
  const tooltip = event.currentTarget as LumenTooltip
  const hold = tooltip.closest('div')?.querySelector<HTMLInputElement>('input[name="hold"]')
  if (!hold?.checked) {
    tooltip.open = event.detail.open
  }
}

export const Controlled: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'The owner cancels every `lu-open-change` and sets `open` from `detail.open` unless the box is checked: then the tooltip keeps the state it had.',
      },
    },
  },
  render: () => html`
    <div style="display:flex;gap:1rem;align-items:center">
      <button id="controlled-tooltip" class="lu-button lu-button--outline">Controlled</button>
      <lu-tooltip for="controlled-tooltip" @lu-open-change=${holdOpen}>Held by its owner</lu-tooltip>
      <label class="lu-field__choice"><input type="checkbox" class="lu-checkbox" name="hold" /> Hold it</label>
    </div>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector<LumenTooltip>('lu-tooltip')
    const panel = host!
    const trigger = canvas.getByRole('button', { name: 'Controlled' })
    const hold = canvas.getByRole('checkbox', { name: 'Hold it' })

    await step('The owner sets open from the event: hovering shows it', async () => {
      await userEvent.hover(trigger)
      await waitFor(() => expect(isOpen(panel)).toBe(true))
      await expect(host?.open).toBe(true)
    })

    await step('While the owner holds it, neither Escape nor leaving the trigger hides it', async () => {
      hold.focus()
      await userEvent.keyboard(' ')
      await expect(hold).toBeChecked()
      trigger.focus()
      await userEvent.keyboard('{Escape}')
      await userEvent.unhover(trigger)
      await expect(host?.open).toBe(true)
      await expect(isOpen(panel)).toBe(true)
    })

    await step('The owner hides it by clearing open', async () => {
      if (host) {
        host.open = false
      }
      await waitFor(() => expect(isOpen(panel)).toBe(false))
    })
  },
}
