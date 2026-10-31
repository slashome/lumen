import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect } from 'storybook/test'

const meta: Meta = {
  title: 'Navigation/Breadcrumb',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `The path from the root to the current page. A \`<nav>\` named by \`aria-label\`, around an ordered list of links; a chevron separates the items, drawn by the CSS so that screen readers do not read it. The last item is the current page: give it \`aria-current="page"\`, on a link or on a \`<span>\`.

| Class | Use |
| --- | --- |
| \`.lu-breadcrumb\` | The \`<nav aria-label="Breadcrumb">\`. |
| \`.lu-breadcrumb__list\` | The \`<ol>\`. |
| \`.lu-breadcrumb__item\` | Each \`<li>\`; every item after the first starts with a chevron. |
| \`.lu-breadcrumb__link\` | The \`<a>\` of an item, or the \`<span aria-current="page">\` of the current one. Long names are cut with an ellipsis. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <nav class="lu-breadcrumb" aria-label="Breadcrumb">
      <ol class="lu-breadcrumb__list">
        <li class="lu-breadcrumb__item"><a class="lu-breadcrumb__link" href="#home">slashome</a></li>
        <li class="lu-breadcrumb__item"><a class="lu-breadcrumb__link" href="#lumen">lumen</a></li>
        <li class="lu-breadcrumb__item"><a class="lu-breadcrumb__link" href="#s004">S004 — Complete the catalogue</a></li>
        <li class="lu-breadcrumb__item"><span class="lu-breadcrumb__link" aria-current="page">T022</span></li>
      </ol>
    </nav>
  `,
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(canvas.getAllByRole('link').map((link) => link.textContent)).toEqual(['slashome', 'lumen', 'S004 — Complete the catalogue'])
    await expect(canvas.getByText('T022')).toHaveAttribute('aria-current', 'page')
  },
}
