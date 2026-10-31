import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const DataTable: StoryObj = {
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
