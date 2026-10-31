import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const DragAndDrop: StoryObj = {
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
}
