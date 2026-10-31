import { css, html, LitElement } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import type { ValueChangeDetail } from '../select/select'

export class LumenSegmented extends LitElement {
  static properties = {
    label: {},
    values: { type: Array },
    value: {},
    focusable: { type: Boolean, converter: { fromAttribute: (value: string | null) => value !== 'false' } },
  }

  static styles = css`
    :host {
      display: inline-flex;
    }

    .group {
      display: inline-flex;
      overflow: hidden;
      border: 1px solid var(--lu-color-border);
      border-radius: var(--lu-radius-md);
    }

    button {
      padding: 0.125rem var(--lu-space-1-5);
      border: 0;
      background: none;
      color: var(--lu-color-muted-foreground);
      font: inherit;
      font-size: var(--lu-font-size-2xs);
      cursor: pointer;
    }

    button:hover {
      background: var(--lu-color-muted);
    }

    button[aria-pressed='true'] {
      background: var(--lu-color-primary);
      color: var(--lu-color-primary-foreground);
    }

    button:focus-visible {
      outline: 2px solid var(--lu-color-ring);
      outline-offset: -2px;
    }
  `

  declare label: string
  declare values: string[]
  declare value: string | null
  declare focusable: boolean

  constructor() {
    super()
    this.label = ''
    this.values = []
    this.value = null
    this.focusable = true
  }

  private press(event: MouseEvent, entry: string) {
    event.stopPropagation()
    const value = this.value === entry ? null : entry
    this.value = value
    emit<ValueChangeDetail<string | null>>(this, 'lu-value-change', { value })
  }

  render() {
    return html`
      <div class="group" role="group" aria-label=${this.label} part="group">
        ${this.values.map(
          (entry) => html`
            <button type="button" tabindex=${this.focusable ? 0 : -1} aria-pressed=${String(this.value === entry)} @click=${(event: MouseEvent) => this.press(event, entry)}>
              ${entry}
            </button>
          `,
        )}
      </div>
    `
  }
}

define('lu-segmented', LumenSegmented)

declare global {
  interface HTMLElementTagNameMap {
    'lu-segmented': LumenSegmented
  }
}
