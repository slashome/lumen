import { css, html, nothing } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import { MessagesController } from '../../lib/messages'
import { buttonStyles } from '../../lib/styles'
import { LumenModal } from '../dialog/modal'

export type { OpenChangeDetail } from '../../lib/change'

/**
 * An `alertdialog` that asks to confirm a destructive action, with a cancel and a confirm button. The cancel button takes the focus; a click on the backdrop does not close it.
 *
 * It closes itself as `lu-dialog` does, on Escape or its cancel button, after a cancelable `lu-open-change`. The confirm button does not close it: it fires `lu-confirm`, and the owner runs the action, then clears `open`. It has no close button.
 *
 * `confirm-label` is required on every instance: a verb that names the action, never a generic « Confirm ». The cancel button is named by `cancel-label`, or else by the `cancel` message registered with `registerLumenMessages()`.
 *
 * @summary A dialog that asks to confirm a destructive action.
 * @tag lu-confirm-dialog
 * @cssprop --lu-dialog-width - The inline size of the dialog, capped by the viewport. Defaults to 28rem.
 * @fires {CustomEvent<OpenChangeDetail>} lu-open-change - The user asked to close the dialog. `detail.open` is `false`; `detail.source` is `escape` or `cancel` (the cancel button). Cancelable: `preventDefault()` keeps the dialog open, and the element still holds `open` while the event runs.
 * @fires {CustomEvent<Record<string, never>>} lu-confirm - The user pressed the confirm button. The owner runs the action, then closes the dialog. Not cancelable: the dialog runs nothing itself.
 */
export class LumenConfirmDialog extends LumenModal {
  static properties = {
    ...LumenModal.properties,
    confirmLabel: { attribute: 'confirm-label' },
    cancelLabel: { attribute: 'cancel-label' },
    pending: { type: Boolean, reflect: true },
  }

  static styles = [
    buttonStyles,
    ...LumenModal.styles,
    css`
      dialog {
        inline-size: var(--lu-dialog-width, 28rem);
      }

      .description {
        overflow-wrap: break-word;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--lu-space-2);
        margin-block-start: var(--lu-space-2);
      }
    `,
  ]

  /** Required. The text of the confirm button, a verb that names the action: "Delete". It has no registered default. */
  declare confirmLabel: string
  /** The text of the cancel button. Overrides the `cancel` message registered with `registerLumenMessages()`. */
  declare cancelLabel: string
  /** Whether the action is running: the confirm button is disabled until the owner clears it. */
  declare pending: boolean
  private messages = new MessagesController(this)

  constructor() {
    super()
    this.confirmLabel = ''
    this.cancelLabel = ''
    this.pending = false
  }

  protected onBackdropClick() {}

  private confirm() {
    emit(this, 'lu-confirm', {})
  }

  private onCancelButton() {
    this.requestOpen(false, 'cancel')
  }

  render() {
    return html`
      <dialog
        part="dialog"
        role="alertdialog"
        aria-labelledby="title"
        aria-describedby=${this.described ? 'description' : nothing}
        @cancel=${this.onCancel}
        @close=${this.onClose}
      >
        <div class="panel" part="panel">
          <h2 id="title" class="title" part="title"><slot name="heading">${this.heading}</slot></h2>
          ${this.renderDescription()}
          <slot></slot>
          <div class="actions">
            <button type="button" class="lu-button lu-button--outline lu-button--sm" @click=${this.onCancelButton} autofocus>
              ${this.messages.text('cancel', this.cancelLabel, 'cancel-label') ?? nothing}
            </button>
            <button type="button" class="lu-button lu-button--danger lu-button--sm" ?disabled=${this.pending} @click=${this.confirm}>
              ${this.messages.required(this.confirmLabel, 'confirm-label') ?? nothing}
            </button>
          </div>
        </div>
      </dialog>
    `
  }
}

define('lu-confirm-dialog', LumenConfirmDialog)

declare global {
  interface HTMLElementTagNameMap {
    'lu-confirm-dialog': LumenConfirmDialog
  }
}
