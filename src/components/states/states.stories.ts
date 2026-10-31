import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 0 (CSS)/Components' }
export default meta

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
