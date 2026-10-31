import { css, html, LitElement, nothing, unsafeCSS } from 'lit'
import { define } from '../../lib/define'
import { emit } from '../../lib/emit'
import { MessagesController } from '../../lib/messages'
import { buttonStyles } from '../../lib/styles'
import tagCss from './tag.css?inline'
import '../icon/icon'

export interface RemoveDetail {
  value: string
}

/**
 * A tag the user can remove: the text of the tag and a remove button. A tag that cannot be removed needs no element: it is the CSS class `.lu-tag` on a `<span>`.
 *
 * The default slot holds the text of the tag. The remove button is named by the `tagRemove` message registered with `registerLumenMessages()`, given that text: « Remove Design ». A click on it, or Delete or Backspace while it has the focus, fires `lu-remove`.
 *
 * The tag never removes itself: the owner removes it from its data, and moves the focus, to the next tag or to the field the tags belong to.
 *
 * @summary A tag with a button that asks its owner to remove it.
 * @tag lu-tag
 * @slot - The text of the tag, which also names its remove button.
 * @csspart tag - The tag itself.
 * @csspart remove - The remove button.
 * @fires {CustomEvent<RemoveDetail>} lu-remove - The user pressed the remove button, or Delete or Backspace on it. `detail.value` is the `value` of the tag, or its text without one. Not cancelable: the tag removes nothing, the owner does.
 */
export class LumenTag extends LitElement {
  static properties = {
    value: { reflect: true },
    removable: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    text: { state: true },
  }

  static styles = [
    unsafeCSS(tagCss),
    buttonStyles,
    css`
      :host {
        display: inline-flex;
        max-inline-size: 100%;
      }

      :host([hidden]) {
        display: none;
      }

      .lu-tag {
        padding-inline-end: var(--lu-space-1);
      }

      :host(:not([removable])) .lu-tag {
        padding-inline-end: var(--lu-space-2);
      }

      .text {
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .lu-icon-button {
        --lu-icon-size: 0.75rem;
        inline-size: 1rem;
        block-size: 1rem;
      }

      .lu-icon-button:focus-visible {
        outline: 2px solid var(--lu-color-ring);
        outline-offset: 1px;
      }

      .lu-icon-button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `,
  ]

  /** What the owner knows the tag by, sent in `lu-remove`. Without it, the event carries the text of the tag. */
  declare value: string
  /** Whether the tag shows its remove button. */
  declare removable: boolean
  /** Whether the remove button ignores the user. */
  declare disabled: boolean
  declare private text: string
  private messages = new MessagesController(this)

  constructor() {
    super()
    this.value = ''
    this.removable = false
    this.disabled = false
    this.text = ''
  }

  connectedCallback() {
    super.connectedCallback()
    this.readText()
  }

  private readText() {
    this.text = (this.textContent ?? '').trim()
  }

  private requestRemoval() {
    if (!this.disabled) {
      emit<RemoveDetail>(this, 'lu-remove', { value: this.value || this.text })
    }
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      this.requestRemoval()
    }
  }

  render() {
    return html`
      <span class="lu-tag" part="tag">
        <span class="text"><slot @slotchange=${this.readText}></slot></span>
        ${this.removable
          ? html`<button
              type="button"
              class="lu-icon-button"
              part="remove"
              aria-label=${this.messages.format('tagRemove', { label: this.text }) || nothing}
              ?disabled=${this.disabled}
              @click=${this.requestRemoval}
              @keydown=${this.onKeydown}
            >
              <lu-icon name="close"></lu-icon>
            </button>`
          : nothing}
      </span>
    `
  }
}

define('lu-tag', LumenTag)

declare global {
  interface HTMLElementTagNameMap {
    'lu-tag': LumenTag
  }
}
