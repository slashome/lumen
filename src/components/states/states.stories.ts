import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Feedback/States',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `The states of a page or a region: its header, nothing to show, loading, an error, and a page not built yet.

| Class | Use |
| --- | --- |
| \`.lu-page-header\` | The header of a page: a title, a description and actions. |
| \`.lu-page-header__main\` | The column that holds the title and the description. |
| \`.lu-page-header__title\` | The \`<h1>\`. |
| \`.lu-page-header__description\` | A sentence under the title. |
| \`.lu-page-header__actions\` | The buttons at the end of the header. |
| \`.lu-empty-state\` | Nothing to show: a dashed box with an icon, a title and a sentence. |
| \`.lu-empty-state__icon\` | The \`<lu-icon>\` of the empty state. |
| \`.lu-empty-state__title\` | The title of the empty state. |
| \`.lu-loading-state\` | A loading placeholder; give it \`role="status"\` and an \`aria-label\`. |
| \`.lu-loading-state__row\` | One pulsing row of the placeholder; each next row fades. |
| \`.lu-error-state\` | An error message on a danger tint; give it \`role="alert"\`. |
| \`.lu-coming-soon\` | A page not built yet: a centered title and a sentence. |
| \`.lu-coming-soon__title\` | The title of the coming-soon page. |
| \`.lu-coming-soon__text\` | The sentence of the coming-soon page. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:1.5rem">
      <div class="lu-page-header">
        <div class="lu-page-header__main">
          <h1 class="lu-page-header__title">Tasks</h1>
          <p class="lu-page-header__description">Every task of the tree.</p>
        </div>
        <div class="lu-page-header__actions"><button class="lu-button lu-button--sm">New task</button></div>
      </div>
      <div class="lu-empty-state">
        <lu-icon class="lu-empty-state__icon" name="inbox"></lu-icon>
        <p class="lu-empty-state__title">Nothing to do</p>
        Every task is done.
      </div>
      <div role="status" aria-label="Loading…" class="lu-loading-state">
        <div class="lu-loading-state__row"></div>
        <div class="lu-loading-state__row"></div>
        <div class="lu-loading-state__row"></div>
      </div>
      <p role="alert" class="lu-error-state">The content repository could not be read.</p>
    </div>
  `,
}
