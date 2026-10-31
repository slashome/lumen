import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

export const Button: StoryObj = {
  render: () => html`
    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
      <button class="lu-button">Default</button>
      <button class="lu-button lu-button--outline">Outline</button>
      <button class="lu-button lu-button--ghost">Ghost</button>
      <button class="lu-button lu-button--destructive">Delete</button>
      <button class="lu-button lu-button--sm">Small</button>
      <button class="lu-button lu-button--outline lu-button--icon" aria-label="Add"><lu-icon name="add"></lu-icon></button>
      <button class="lu-icon-button" aria-label="Copy"><lu-icon name="copy"></lu-icon></button>
      <button class="lu-button" disabled>Disabled</button>
    </div>
  `,
}

export const Badge: StoryObj = {
  render: () => html`
    <span class="lu-badge">todo</span>
    <span class="lu-badge lu-badge--outline">backlog</span>
    <span class="lu-badge lu-badge--primary">in progress</span>
  `,
}

export const Fields: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:0.75rem;max-inline-size:20rem">
      <input class="lu-input" placeholder="Search items" aria-label="Search items" />
      <span class="lu-native-select">
        <select class="lu-native-select__control" aria-label="Status">
          <option>todo</option>
          <option>in progress</option>
          <option>done</option>
        </select>
      </span>
      <label style="display:flex;gap:0.5rem;align-items:center"><input type="checkbox" role="switch" class="lu-switch" checked /> Sub-nodes</label>
      <p>Press <kbd class="lu-kbd">⌘</kbd> <kbd class="lu-kbd">K</kbd></p>
    </div>
  `,
}

export const States: StoryObj = {
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
