import { css, html, LitElement, nothing, type PropertyValues } from 'lit'
import { define } from '../../lib/define'
import '../icon/icon'

/**
 * One choice of a `lu-select`. It has no meaning outside one.
 *
 * @summary One choice of a select.
 * @tag lu-option
 * @slot - The label of the option.
 */
export class LumenOption extends LitElement {
  static properties = {
    value: { reflect: true },
    textValue: { attribute: 'text-value' },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  }

  static styles = css`
    :host {
      position: relative;
      display: flex;
      align-items: center;
      padding-block: var(--lu-space-1);
      padding-inline: 1.75rem var(--lu-space-2);
      border-radius: var(--lu-radius-sm);
      outline: none;
      cursor: pointer;
      user-select: none;
    }

    :host(:hover),
    :host(:focus) {
      background: var(--lu-color-muted);
    }

    :host([selected]) {
      font-weight: var(--lu-font-weight-medium);
    }

    :host([disabled]) {
      cursor: default;
      opacity: 0.5;
    }

    .check {
      position: absolute;
      inset-inline-start: var(--lu-space-2);
      display: inline-flex;
      --lu-icon-size: 0.875rem;
    }
  `

  /** The value the select takes when this option is picked. */
  declare value: string
  /** The text used for typeahead and for the button of the select, when the content of the option is not plain text. */
  declare textValue: string
  /** Whether this option is the selected one. The select sets it from its `value`. */
  declare selected: boolean
  /** Whether the option cannot be picked. It stays visible and is skipped by the keyboard. */
  declare disabled: boolean

  constructor() {
    super()
    this.value = ''
    this.textValue = ''
    this.selected = false
    this.disabled = false
  }

  /** The text of the option: `textValue`, or its text content. */
  get label(): string {
    return this.textValue || (this.textContent ?? '').trim()
  }

  connectedCallback() {
    super.connectedCallback()
    this.setAttribute('role', 'option')
    this.tabIndex = -1
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('selected')) {
      this.setAttribute('aria-selected', String(this.selected))
    }
    if (changed.has('disabled')) {
      this.toggleAttribute('aria-disabled', this.disabled)
    }
  }

  render() {
    return html`<span class="check">${this.selected ? html`<lu-icon name="check"></lu-icon>` : nothing}</span><slot></slot>`
  }
}

define('lu-option', LumenOption)

declare global {
  interface HTMLElementTagNameMap {
    'lu-option': LumenOption
  }
}
