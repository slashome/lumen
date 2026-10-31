import { css, html, LitElement, nothing, type PropertyValues } from 'lit'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import { buttonStyles } from '../../lib/styles'
import '../icon/icon'

export interface OpenChangeDetail {
  open: boolean
}

/**
 * A modal dialog on the native `<dialog>`: it traps focus, closes on Escape, a click on the backdrop or its close button, and restores focus on close.
 *
 * The dialog is controlled: it never closes itself, it fires `lu-open-change` with `open: false` and the owner sets `open`.
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
 * @fires {CustomEvent<OpenChangeDetail>} lu-open-change - The user asked to close the dialog: Escape, the backdrop, the close button. `detail.open` is `false`. Not cancelable: the dialog never closes itself, so there is nothing to prevent; leave `open` set to keep it open.
 */
export class LumenDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: {},
    description: {},
    closeLabel: { attribute: 'close-label' },
    slottedDescription: { state: true },
  }

  static styles = [
    buttonStyles,
    css`
      :host {
        display: contents;
      }

      dialog {
        box-sizing: border-box;
        inline-size: var(--lu-dialog-width, 56rem);
        max-inline-size: calc(100% - 2rem);
        max-block-size: 85vh;
        padding: 0;
        border: 1px solid var(--lu-color-border);
        border-radius: var(--lu-radius-lg);
        background: var(--lu-color-background);
        color: var(--lu-color-foreground);
        font-family: var(--lu-font-family-sans);
        box-shadow: var(--lu-shadow-xl);
      }

      dialog::backdrop {
        background: var(--lu-color-overlay);
      }

      dialog:focus {
        outline: none;
      }

      .panel {
        display: flex;
        flex-direction: column;
        gap: var(--lu-space-3);
        box-sizing: border-box;
        max-block-size: inherit;
        padding: var(--lu-space-5);
      }

      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--lu-space-3);
      }

      .titles {
        display: flex;
        flex-direction: column;
        gap: var(--lu-space-1);
        min-inline-size: 0;
      }

      .title {
        margin: 0;
        overflow: hidden;
        font-size: var(--lu-font-size-base);
        font-weight: var(--lu-font-weight-semibold);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .description[hidden] {
        display: none;
      }

      .description {
        margin: 0;
        color: var(--lu-color-muted-foreground);
        font-size: var(--lu-font-size-sm);
      }

      .close {
        inline-size: 1.5rem;
        block-size: 1.5rem;
      }
    `,
  ]

  /** Whether the dialog is shown, as a modal. The owner sets it; the dialog only asks to change it through `lu-open-change`. */
  declare open: boolean
  /** The title of the dialog, which also names it for assistive technology. */
  declare heading: string
  /** A sentence under the title, which also describes the dialog for assistive technology. */
  declare description: string
  /** The accessible name of the close button. */
  declare closeLabel: string
  declare protected slottedDescription: boolean

  constructor() {
    super()
    this.open = false
    this.heading = ''
    this.description = ''
    this.closeLabel = 'Close'
    this.slottedDescription = false
  }

  protected get dialog(): HTMLDialogElement | null {
    return this.renderRoot.querySelector('dialog')
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      this.sync()
    }
  }

  private sync() {
    const dialog = this.dialog
    if (!dialog) {
      return
    }
    if (this.open && !dialog.open) {
      dialog.showModal()
    } else if (!this.open && dialog.open) {
      dialog.close()
    }
  }

  protected requestClose() {
    emit<OpenChangeDetail>(this, 'lu-open-change', { open: false })
  }

  protected onCancel(event: Event) {
    event.preventDefault()
    this.requestClose()
  }

  protected onClose() {
    if (this.open && !this.dialog?.open) {
      this.open = false
      this.requestClose()
    }
  }

  protected onBackdropClick(event: MouseEvent) {
    if (event.target === this.dialog) {
      this.requestClose()
    }
  }

  protected get described(): boolean {
    return Boolean(this.description) || this.slottedDescription
  }

  private onDescriptionChange(event: Event) {
    this.slottedDescription = (event.target as HTMLSlotElement).assignedNodes().length > 0
  }

  protected renderDescription() {
    return html`<p id="description" class="description" part="description" ?hidden=${!this.described}>
      <slot name="description" @slotchange=${this.onDescriptionChange}>${this.description}</slot>
    </p>`
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
            <button type="button" class="lu-icon-button close" aria-label=${this.closeLabel} @click=${this.requestClose}>
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
