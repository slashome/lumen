import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Navigation/Pagination',
  tags: ['autodocs', 'floor-0'],
  parameters: {
    docs: {
      subtitle: 'Floor 0 — CSS',
      description: {
        component: `Links or buttons to the pages of a long list. A \`<nav>\` named by \`aria-label\`, around a list. Use links when each page has its own URL, buttons when the page changes in place. The current page takes \`aria-current="page"\` and the primary fill; previous and next take an \`aria-label\` and, on the first or the last page, \`disabled\` on a button or \`aria-disabled="true"\` on a link without \`href\`. Which pages to show around the current one is the owner's choice.

| Class | Use |
| --- | --- |
| \`.lu-pagination\` | The \`<nav aria-label="Pagination">\`. |
| \`.lu-pagination__list\` | The \`<ul>\` of pages. |
| \`.lu-pagination__link\` | An \`<a>\` or a \`<button>\` to a page, or previous and next with a \`<lu-icon>\`. |
| \`.lu-pagination__ellipsis\` | The \`…\` that stands for skipped pages, with \`aria-hidden="true"\`. |`,
      },
    },
  },
}
export default meta

export const Links: StoryObj = {
  render: () => html`
    <nav class="lu-pagination" aria-label="Pagination">
      <ul class="lu-pagination__list">
        <li><a class="lu-pagination__link" href="#page-3" aria-label="Previous page"><lu-icon name="chevron-left"></lu-icon></a></li>
        <li><a class="lu-pagination__link" href="#page-1">1</a></li>
        <li><span class="lu-pagination__ellipsis" aria-hidden="true">…</span></li>
        <li><a class="lu-pagination__link" href="#page-3">3</a></li>
        <li><a class="lu-pagination__link" href="#page-4" aria-current="page">4</a></li>
        <li><a class="lu-pagination__link" href="#page-5">5</a></li>
        <li><span class="lu-pagination__ellipsis" aria-hidden="true">…</span></li>
        <li><a class="lu-pagination__link" href="#page-12">12</a></li>
        <li><a class="lu-pagination__link" href="#page-5" aria-label="Next page"><lu-icon name="chevron-right"></lu-icon></a></li>
      </ul>
    </nav>
  `,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: '4' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '#page-3')
  },
}

export const Buttons: StoryObj = {
  render: () => html`
    <nav class="lu-pagination" aria-label="Pagination of the results">
      <ul class="lu-pagination__list">
        <li><button type="button" class="lu-pagination__link" aria-label="Previous page" disabled><lu-icon name="chevron-left"></lu-icon></button></li>
        <li><button type="button" class="lu-pagination__link" aria-current="page">1</button></li>
        <li><button type="button" class="lu-pagination__link">2</button></li>
        <li><button type="button" class="lu-pagination__link">3</button></li>
        <li><button type="button" class="lu-pagination__link" aria-label="Next page"><lu-icon name="chevron-right"></lu-icon></button></li>
      </ul>
    </nav>
  `,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
  },
}
