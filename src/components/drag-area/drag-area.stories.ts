import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Actions/Drag and drop',
  component: 'lu-drag-area',
  subcomponents: { 'lu-draggable': 'lu-draggable', 'lu-drop-zone': 'lu-drop-zone' },
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/drag-area'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => {
    const move = (event: CustomEvent<{ active: string; over: string | null }>) => {
      const card = document.querySelector(`lu-draggable[drag-id="${event.detail.active}"]`)
      const zone = document.querySelector(`lu-drop-zone[zone-id="${event.detail.over}"]`)
      if (card && zone) {
        zone.append(card)
      }
    }
    const column = (id: string, cards: string[]) => html`
      <lu-drop-zone zone-id=${id} label=${id} style="display:grid;gap:0.5rem;align-content:start;min-block-size:10rem;padding:0.5rem;border:1px dashed var(--lu-color-border);border-radius:var(--lu-radius-lg)">
        <strong>${id}</strong>
        ${cards.map(
          (card) =>
            html`<lu-draggable drag-id=${card} label=${card} style="padding:0.5rem;border:1px solid var(--lu-color-border);background:var(--lu-color-background)"
              >${card}</lu-draggable
            >`,
        )}
      </lu-drop-zone>
    `
    return html`
      <p>Drag with the mouse, or focus a card and press Space, the arrows, then Space again.</p>
      <lu-drag-area @lu-drag-end=${move} style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
        ${column('todo', ['T104', 'T105'])} ${column('in progress', ['T106'])} ${column('done', [])}
      </lu-drag-area>
    `
  },
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const area = canvasElement.querySelector('lu-drag-area')
    const announcer = inShadow(area, '[aria-live="assertive"]')
    const card = (id: string) => canvas.getByRole('button', { name: id })
    const zone = (id: string) => canvas.getByRole('region', { name: id })
    const highlighted = () => [...canvasElement.querySelectorAll('lu-drop-zone[over]')].map((entry) => entry.getAttribute('zone-id'))
    const ends = recordEvents(canvasElement, 'lu-drag-end')

    await expect(card('T104')).toHaveAttribute('aria-roledescription', 'draggable')
    await expect(zone('todo')).toContainElement(card('T104'))

    await step('Space picks a card up and announces it', async () => {
      card('T104').focus()
      await userEvent.keyboard(' ')
      await waitFor(() => expect(card('T104')).toHaveAttribute('dragging'))
      await expect(highlighted()).toEqual(['todo'])
      await waitFor(() => expect(announcer).toHaveTextContent('Picked up T104.'))
    })

    await step('The arrow keys move the card across the zones, wrapping around', async () => {
      await userEvent.keyboard('{ArrowRight}')
      await waitFor(() => expect(highlighted()).toEqual(['in progress']))
      await waitFor(() => expect(announcer).toHaveTextContent('Over in progress.'))
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
      await waitFor(() => expect(highlighted()).toEqual(['done']))
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      await waitFor(() => expect(highlighted()).toEqual(['in progress']))
    })

    await step('Space drops the card, fires lu-drag-end and keeps the focus on it', async () => {
      await userEvent.keyboard(' ')
      await expect(ends).toHaveBeenCalledOnce()
      await expect(ends).toHaveBeenCalledWith({ active: 'T104', over: 'in progress' })
      await expect(zone('in progress')).toContainElement(card('T104'))
      await expect(card('T104')).toHaveFocus()
      await waitFor(() => expect(card('T104')).not.toHaveAttribute('dragging'))
      await expect(highlighted()).toEqual([])
      await waitFor(() => expect(announcer).toHaveTextContent('Dropped on in progress.'))
    })

    await step('Escape cancels a move without firing lu-drag-end', async () => {
      card('T105').focus()
      await userEvent.keyboard(' ')
      await waitFor(() => expect(card('T105')).toHaveAttribute('dragging'))
      await userEvent.keyboard('{ArrowRight}{Escape}')
      await expect(ends).toHaveBeenCalledOnce()
      await expect(zone('todo')).toContainElement(card('T105'))
      await expect(card('T105')).toHaveFocus()
      await waitFor(() => expect(card('T105')).not.toHaveAttribute('dragging'))
      await waitFor(() => expect(announcer).toHaveTextContent('Move cancelled.'))
    })

    await step('Enter drops as Space does', async () => {
      await userEvent.keyboard(' ')
      await userEvent.keyboard('{ArrowLeft}{Enter}')
      await expect(ends).toHaveBeenLastCalledWith({ active: 'T105', over: 'done' })
      await expect(zone('done')).toContainElement(card('T105'))
    })
  },
}
