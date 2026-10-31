import { css, html, LitElement } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import type { ValueChangeDetail } from '../../lib/change'

/**
 * A row of toggle buttons where at most one is pressed. Pressing the pressed one releases it, so the value can be empty.
 *
 * It fires `lu-value-change` when the user presses a button, then sets its own `value` unless a listener cancels the event.
 *
 * @summary A row of toggle buttons with at most one pressed.
 * @tag lu-segmented
 * @csspart group - The bordered row of buttons.
 * @fires {CustomEvent<ValueChangeDetail<string | null>>} lu-value-change - The user pressed a button. `detail.value` is its value, or `null` when the pressed one was released; `detail.source` is `option`. Cancelable: `preventDefault()` keeps the current `value`, which the element still holds while the event runs.
 */
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

  /** The accessible name of the group. */
  declare label: string
  /** The values, one button each, shown as they are. */
  declare values: string[]
  /** The pressed value, or `null` when none is. */
  declare value: string | null
  /** Whether the buttons are in the tab order. On by default; only the attribute value `false` turns it off. */
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
    if (emit<ValueChangeDetail<string | null>>(this, 'lu-value-change', { value, source: 'option' }, { cancelable: true })) {
      this.value = value
    }
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
