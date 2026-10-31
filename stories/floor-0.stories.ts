import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const Button: StoryObj = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
      <button class="lumen-button">Default</button>
      <button class="lumen-button lumen-button--outline">Outline</button>
      <button class="lumen-button lumen-button--ghost">Ghost</button>
      <button class="lumen-button lumen-button--destructive">Delete</button>
      <button class="lumen-button lumen-button--sm">Small</button>
      <button class="lumen-button lumen-button--outline lumen-button--icon" aria-label="Add"><lumen-icon name="add"></lumen-icon></button>
      <button class="lumen-icon-button" aria-label="Copy"><lumen-icon name="copy"></lumen-icon></button>
      <button class="lumen-button" disabled>Disabled</button>
    </div>
  `,
}

export const Badge: StoryObj = {
  render: () => html`
    <span class="lumen-badge">todo</span>
    <span class="lumen-badge lumen-badge--outline">backlog</span>
    <span class="lumen-badge lumen-badge--primary">in progress</span>
  `,
}

export const Fields: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <input class="lumen-input" placeholder="Search items" aria-label="Search items" />
      <span class="lumen-native-select">
        <select class="lumen-native-select__control" aria-label="Status">
          <option>todo</option>
          <option>in progress</option>
          <option>done</option>
        </select>
      </span>
      <label style="display:flex;gap:0.5rem;align-items:center"><input type="checkbox" role="switch" class="lumen-switch" checked /> Sub-nodes</label>
      <p>Press <kbd class="lumen-kbd">⌘</kbd> <kbd class="lumen-kbd">K</kbd></p>
    </div>
  `,
}

export const States: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:1.5rem">
      <div class="lumen-page-header">
        <div class="lumen-page-header__main">
          <h1 class="lumen-page-header__title">Tasks</h1>
          <p class="lumen-page-header__description">Every task of the tree.</p>
        </div>
        <div class="lumen-page-header__actions"><button class="lumen-button lumen-button--sm">New task</button></div>
      </div>
      <div class="lumen-empty-state">
        <lumen-icon class="lumen-empty-state__icon" name="inbox"></lumen-icon>
        <p class="lumen-empty-state__title">Nothing to do</p>
        Every task is done.
      </div>
      <div role="status" aria-label="Loading…" class="lumen-loading-state">
        <div class="lumen-loading-state__row"></div>
        <div class="lumen-loading-state__row"></div>
        <div class="lumen-loading-state__row"></div>
      </div>
      <p role="alert" class="lumen-error-state">The content repository could not be read.</p>
    </div>
  `,
}

export const DataTable: StoryObj = {
  render: () => html`
    <div class="lumen-data-table">
      <table class="lumen-data-table__table" aria-label="Tasks">
        <thead class="lumen-data-table__head">
          <tr>
            <th class="lumen-data-table__header" scope="col" aria-sort="ascending">
              <button class="lumen-data-table__sort" data-direction="asc">Id <lumen-icon class="lumen-data-table__sort-icon" name="sort-asc"></lumen-icon></button>
            </th>
            <th class="lumen-data-table__header" scope="col" aria-sort="none">
              <button class="lumen-data-table__sort">Title <lumen-icon class="lumen-data-table__sort-icon" name="sort"></lumen-icon></button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="lumen-data-table__row"><td class="lumen-data-table__cell">T1</td><td class="lumen-data-table__cell">Draw the fairy</td></tr>
          <tr class="lumen-data-table__row"><td class="lumen-data-table__cell">T2</td><td class="lumen-data-table__cell">Beat the wings</td></tr>
        </tbody>
      </table>
    </div>
  `,
}
