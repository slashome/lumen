import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { toast } from '../src/lib/toast'
import type { LumenDialog } from '../src/elements/dialog'
import { iconNames } from '../src/lib/icons'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

function openNext(event: Event) {
  const dialog = (event.currentTarget as HTMLElement).nextElementSibling as LumenDialog
  dialog.open = true
}

function closeSelf(event: Event) {
  ;(event.currentTarget as LumenDialog).open = false
}

export const Icon: StoryObj = {
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:0.75rem;font-size:0.75rem">
      ${iconNames().map((name) => html`<span style="display:flex;gap:0.5rem;align-items:center"><lumen-icon name=${name}></lumen-icon>${name}</span>`)}
    </div>
  `,
}

export const Dialog: StoryObj = {
  render: () => html`
    <button class="lumen-button" @click=${openNext}>Open the dialog</button>
    <lumen-dialog heading="Edit T104" description="The fields of the item header." @lumen-open-change=${closeSelf}>
      <input class="lumen-input" aria-label="Title" value="The token and the light effect" />
    </lumen-dialog>
  `,
}

export const Sheet: StoryObj = {
  render: () => html`
    <button class="lumen-button lumen-button--outline" @click=${openNext}>Open the sheet</button>
    <lumen-sheet heading="T104 — The token and the light effect" @lumen-open-change=${closeSelf}>
      <lumen-markdown source="One token sets the duration, the curve and the intensity of the flash."></lumen-markdown>
    </lumen-sheet>
  `,
}

export const ConfirmDialog: StoryObj = {
  render: () => html`
    <button class="lumen-button lumen-button--destructive" @click=${openNext}>Delete</button>
    <lumen-confirm-dialog
      heading="Delete T104?"
      description="The file is removed from the tree; git keeps its history."
      confirm-label="Delete"
      @lumen-open-change=${closeSelf}
      @lumen-confirm=${closeSelf}
    ></lumen-confirm-dialog>
  `,
}

export const Tooltip: StoryObj = {
  render: () => html`
    <lumen-tooltip content="~/workspace/projects/slashome/_ariane">
      <button class="lumen-button lumen-button--outline">Content repository</button>
    </lumen-tooltip>
  `,
}

export const HoverCard: StoryObj = {
  render: () => html`
    <lumen-hover-card open-delay="100" placement="bottom-start">
      <button slot="trigger" class="lumen-button lumen-button--outline">3 uncommitted changes</button>
      <p style="margin:0">Commit everything, commit per node, or push.</p>
    </lumen-hover-card>
  `,
}

export const Select: StoryObj = {
  render: () => html`
    <lumen-select label="Status" value="todo" style="inline-size:14rem">
      <lumen-option value="backlog">backlog</lumen-option>
      <lumen-option value="todo">todo</lumen-option>
      <lumen-option value="in_progress">in progress</lumen-option>
      <lumen-option value="done">done</lumen-option>
      <lumen-option value="dropped" disabled>dropped</lumen-option>
    </lumen-select>
  `,
}

export const MultiSelect: StoryObj = {
  render: () => html`
    <lumen-multi-select
      label="Kind"
      .options=${[
        { value: 'task', label: 'Task' },
        { value: 'story', label: 'Story' },
        { value: 'epic', label: 'Epic' },
      ]}
      .selected=${['task']}
    ></lumen-multi-select>
  `,
}

export const Segmented: StoryObj = {
  render: () => html`<lumen-segmented label="Size" .values=${['XS', 'S', 'M', 'L', 'XL']} value="M"></lumen-segmented>`,
}

export const Toaster: StoryObj = {
  render: () => html`
    <lumen-toaster></lumen-toaster>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <button class="lumen-button lumen-button--outline" @click=${() => toast.success('T104 planned: todo')}>Success</button>
      <button class="lumen-button lumen-button--outline" @click=${() => toast.error('The workflow has no status in the todo category')}>Error</button>
      <button class="lumen-button lumen-button--outline" @click=${() => toast.info('Pulled 3 commits')}>Info</button>
      <button class="lumen-button lumen-button--outline" @click=${() => toast.warning('The branch has diverged')}>Warning</button>
    </div>
  `,
}

export const Markdown: StoryObj = {
  render: () =>
    html`<lumen-markdown
      .source=${'## Découpage\n\n1. [T104](T104.md) — le jeton\n2. [T999](T999.md) — un lien mort\n\nSee [the spec](https://github.com/slashome/ariane).\n\n| Key | Value |\n| --- | --- |\n| status | `todo` |\n\n> La lumière marque l\'action.'}
      .resolveLink=${(href: string) =>
        href.startsWith('http') ? { kind: 'external', href } : href === 'T104.md' ? { kind: 'internal', href: '#T104' } : { kind: 'unresolved', title: href }}
    ></lumen-markdown>`,
}

export const Highlight: StoryObj = {
  render: () => html`<p><lumen-highlight text="La lumière marque l'action, la couleur marque l'état" .terms=${['lumiere', 'etat']}></lumen-highlight></p>`,
}

export const DragAndDrop: StoryObj = {
  render: () => {
    const move = (event: CustomEvent<{ active: string; over: string | null }>) => {
      const card = document.querySelector(`lumen-draggable[drag-id="${event.detail.active}"]`)
      const zone = document.querySelector(`lumen-drop-zone[zone-id="${event.detail.over}"]`)
      if (card && zone) {
        zone.append(card)
      }
    }
    const column = (id: string, cards: string[]) => html`
      <lumen-drop-zone zone-id=${id} label=${id} style="display:grid;gap:0.5rem;align-content:start;min-block-size:10rem;padding:0.5rem;border:1px dashed var(--lumen-color-border);border-radius:var(--lumen-radius-lg)">
        <strong>${id}</strong>
        ${cards.map(
          (card) =>
            html`<lumen-draggable drag-id=${card} label=${card} style="padding:0.5rem;border:1px solid var(--lumen-color-border);background:var(--lumen-color-background)"
              >${card}</lumen-draggable
            >`,
        )}
      </lumen-drop-zone>
    `
    return html`
      <p>Drag with the mouse, or focus a card and press Space, the arrows, then Space again.</p>
      <lumen-drag-area @lumen-drag-end=${move} style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
        ${column('todo', ['T104', 'T105'])} ${column('in progress', ['T106'])} ${column('done', [])}
      </lumen-drag-area>
    `
  },
}
