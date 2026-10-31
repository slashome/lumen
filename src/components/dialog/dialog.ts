import { css, html, nothing } from 'lit'
import { define } from '../../lib/define'
import { MessagesController } from '../../lib/messages'
import { buttonStyles } from '../../lib/styles'
import { LumenModal } from './modal'
import '../icon/icon'

export type { OpenChangeDetail, OpenChangeSource } from '../../lib/change'

/**
 * A modal dialog on the native `<dialog>`: it traps focus, closes on Escape, a click on the backdrop or its close button, and restores focus on close.
 *
 * The dialog closes itself: it fires a cancelable `lu-open-change`, then clears `open` unless a listener called `preventDefault()`. To control it, cancel the event and set `open` yourself.
 *
 * The close button is named by `close-label`, or else by the `close` message registered with `registerLumenMessages()`.
 *
 * @summary A modal dialog with a title, an optional description and free content.
 * @tag lu-dialog
 * @slot - The content of the dialog.
 * @slot heading - The title, when it needs markup; replaces the `heading` attribute.
 * @slot description - The description, when it needs markup; replaces the `description` attribute.
 * @csspart dialog - The native `<dialog>` element.
 * @csspart panel - The padded column that holds the header and the content.
 * @csspart title - The `<h2>` that holds the title.
 * @csspart description - The paragraph that holds the description.
 * @cssprop --lu-dialog-width - The inline size of the dialog, capped by the viewport. Defaults to 56rem.
 * @fires {CustomEvent<OpenChangeDetail>} lu-open-change - The user asked to close the dialog. `detail.open` is `false`; `detail.source` is `escape`, `outside` (the backdrop), `close-button`, or `form` (a `<form method="dialog">` inside it). Cancelable: `preventDefault()` keeps the dialog open, and the element still holds `open` while the event runs. When the browser does not let Escape be cancelled, the dialog closes and shows again.
 */
export class LumenDialog extends LumenModal {
  static properties = {
    ...LumenModal.properties,
    closeLabel: { attribute: 'close-label' },
  }

  static styles = [
    buttonStyles,
    ...LumenModal.styles,
    css`
      .close {
        inline-size: 1.5rem;
        block-size: 1.5rem;
      }
    `,
  ]

  /** The accessible name of the close button. Overrides the `close` message registered with `registerLumenMessages()`. */
  declare closeLabel: string
  private messages = new MessagesController(this)

  constructor() {
    super()
    this.closeLabel = ''
  }

  private onCloseButton() {
    this.requestOpen(false, 'close-button')
  }

  render() {
    return html`
      <dialog
        part="dialog"
        aria-labelledby="title"
        aria-describedby=${this.described ? 'description' : nothing}
        @cancel=${this.onCancel}
        @close=${this.onClose}
        @click=${this.onBackdropClick}
      >
        <div class="panel" part="panel">
          <div class="header">
            <div class="titles">
              <h2 id="title" class="title" part="title"><slot name="heading">${this.heading}</slot></h2>
              ${this.renderDescription()}
            </div>
            <button type="button" class="lu-icon-button close" aria-label=${this.messages.text('close', this.closeLabel, 'close-label') ?? nothing} @click=${this.onCloseButton}>
              <lu-icon name="close"></lu-icon>
            </button>
          </div>
          <slot></slot>
        </div>
      </dialog>
    `
  }
}

define('lu-dialog', LumenDialog)

declare global {
  interface HTMLElementTagNameMap {
    'lu-dialog': LumenDialog
  }
}
