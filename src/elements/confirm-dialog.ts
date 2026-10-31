import { css, html, nothing } from 'lit'
import { emit } from '../lib/emit'
import { define } from './define'
import { LumenDialog } from './dialog'

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

  declare confirmLabel: string
  declare cancelLabel: string
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
            <button type="button" class="lu-button lu-button--destructive lu-button--sm" ?disabled=${this.pending} @click=${this.confirm}>
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
