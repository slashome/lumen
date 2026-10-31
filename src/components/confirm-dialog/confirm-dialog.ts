import { css, html, nothing } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import { LumenDialog } from '../dialog/dialog'

/**
 * An `alertdialog` that asks to confirm a destructive action, with a cancel and a confirm button. The cancel button takes the focus; a click on the backdrop does not close it.
 *
 * It behaves as `lu-dialog`: controlled through `open` and `lu-open-change`. It has no close button, so `close-label` is unused.
 *
 * @summary A dialog that asks to confirm a destructive action.
 * @tag lu-confirm-dialog
 * @cssprop --lu-dialog-width - The inline size of the dialog, capped by the viewport. Defaults to 28rem.
 * @fires {CustomEvent<Record<string, never>>} lu-confirm - The user pressed the confirm button. The owner runs the action, then closes the dialog. Not cancelable: the dialog runs nothing itself.
 */
export class LumenConfirmDialog extends LumenDialog {
  static properties = {
    ...LumenDialog.properties,
    confirmLabel: { attribute: 'confirm-label' },
    cancelLabel: { attribute: 'cancel-label' },
    pending: { type: Boolean, reflect: true },
  }

  static styles = [
    ...LumenDialog.styles,
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

  /** The text of the confirm button, a verb that names the action: "Delete". */
  declare confirmLabel: string
  /** The text of the cancel button. */
  declare cancelLabel: string
  /** Whether the action is running: the confirm button is disabled until the owner clears it. */
  declare pending: boolean

  constructor() {
    super()
    this.confirmLabel = 'Confirm'
    this.cancelLabel = 'Cancel'
    this.pending = false
  }

  protected onBackdropClick() {}

  private confirm() {
    emit(this, 'lu-confirm', {})
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
            <button type="button" class="lu-button lu-button--outline lu-button--sm" @click=${this.requestClose} autofocus>
              ${this.cancelLabel}
            </button>
            <button type="button" class="lu-button lu-button--danger lu-button--sm" ?disabled=${this.pending} @click=${this.confirm}>
              ${this.confirmLabel}
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
