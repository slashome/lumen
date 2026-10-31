import { css, html, LitElement, nothing, type PropertyValues } from 'lit'
import { define } from './define'
import './icon'

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
      padding-block: var(--lumen-space-1);
      padding-inline: 1.75rem var(--lumen-space-2);
      border-radius: var(--lumen-radius-sm);
      outline: none;
      cursor: pointer;
      user-select: none;
    }

    :host(:hover),
    :host(:focus) {
      background: var(--lumen-color-muted);
    }

    :host([selected]) {
      font-weight: var(--lumen-font-weight-medium);
    }

    :host([disabled]) {
      cursor: default;
      opacity: 0.5;
    }

    .check {
      position: absolute;
      inset-inline-start: var(--lumen-space-2);
      display: inline-flex;
      --lumen-icon-size: 0.875rem;
    }
  `

  declare value: string
  declare textValue: string
  declare selected: boolean
  declare disabled: boolean

  constructor() {
    super()
    this.value = ''
    this.textValue = ''
    this.selected = false
    this.disabled = false
  }

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
    return html`<span class="check">${this.selected ? html`<lumen-icon name="check"></lumen-icon>` : nothing}</span><slot></slot>`
  }
}

define('lumen-option', LumenOption)

declare global {
  interface HTMLElementTagNameMap {
    'lumen-option': LumenOption
  }
}
