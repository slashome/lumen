import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = {
  title: 'Data/Data table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: 'CSS class · no JavaScript',
      description: {
        component: `A sortable table on the native \`<table>\`. Sorting needs no element: \`sortRows\` orders the rows and \`storedSort()\` keeps the column and direction across visits; the React adapter wraps both in \`DataTable\`. Set \`aria-sort\` on each sortable header.

| Class | Use |
| --- | --- |
| \`.lu-data-table\` | The bordered wrapper; it scrolls the table horizontally when it overflows. |
| \`.lu-data-table__table\` | The \`<table>\`. |
| \`.lu-data-table__head\` | The \`<thead>\`. |
| \`.lu-data-table__header\` | A \`<th>\`. |
| \`.lu-data-table__sort\` | The button inside a sortable header. \`data-direction="asc"\` or \`"desc"\` marks the sorted column. |
| \`.lu-data-table__sort-icon\` | The \`<lu-icon>\` of the sort button: \`sort\`, \`sort-asc\` or \`sort-desc\`. |
| \`.lu-data-table__row\` | A body \`<tr>\`. |
| \`.lu-data-table__cell\` | A body \`<td>\`. |
| \`.lu-data-table__empty\` | The paragraph shown under the table when it has no rows. |`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div class="lu-data-table">
      <table class="lu-data-table__table" aria-label="Tasks">
        <thead class="lu-data-table__head">
          <tr>
            <th class="lu-data-table__header" scope="col" aria-sort="ascending">
              <button class="lu-data-table__sort" data-direction="asc">Id <lu-icon class="lu-data-table__sort-icon" name="sort-asc"></lu-icon></button>
            </th>
            <th class="lu-data-table__header" scope="col" aria-sort="none">
              <button class="lu-data-table__sort">Title <lu-icon class="lu-data-table__sort-icon" name="sort"></lu-icon></button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="lu-data-table__row"><td class="lu-data-table__cell">T1</td><td class="lu-data-table__cell">Draw the fairy</td></tr>
          <tr class="lu-data-table__row"><td class="lu-data-table__cell">T2</td><td class="lu-data-table__cell">Beat the wings</td></tr>
        </tbody>
      </table>
    </div>
  `,
}
