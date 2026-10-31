import { css, html, LitElement, nothing, type PropertyValues } from 'lit'
import type { OpenChangeDetail, OpenChangeSource } from '../../lib/change'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import { buttonStyles } from '../../lib/styles'
import '../icon/icon'

export type { OpenChangeDetail, OpenChangeSource } from '../../lib/change'

/**
 * A modal dialog on the native `<dialog>`: it traps focus, closes on Escape, a click on the backdrop or its close button, and restores focus on close.
 *
 * The dialog closes itself: it fires a cancelable `lu-open-change`, then clears `open` unless a listener called `preventDefault()`. To control it, cancel the event and set `open` yourself.
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

  /** Whether the dialog is shown, as a modal. The dialog clears it when the user closes it, unless `lu-open-change` is cancelled. */
  declare open: boolean
  /** The title of the dialog, which also names it for assistive technology. */
  declare heading: string
  /** A sentence under the title, which also describes the dialog for assistive technology. */
  declare description: string
  /** The accessible name of the close button. */
  declare closeLabel: string
  declare protected slottedDescription: boolean
  private forcedEscape = false

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

  protected requestOpen(open: boolean, source: OpenChangeSource): boolean {
    if (!emit<OpenChangeDetail>(this, 'lu-open-change', { open, source }, { cancelable: true })) {
      return false
    }
    this.open = open
    return true
  }

  protected onCancel(event: Event) {
    if (!event.cancelable) {
      this.forcedEscape = true
      return
    }
    event.preventDefault()
    this.requestOpen(false, 'escape')
  }

  protected onClose() {
    const source = this.forcedEscape ? 'escape' : 'form'
    this.forcedEscape = false
    const dialog = this.dialog
    if (!this.open || !dialog || dialog.open) {
      return
    }
    if (!this.requestOpen(false, source)) {
      dialog.showModal()
    }
  }

  protected onBackdropClick(event: MouseEvent) {
    if (event.target === this.dialog) {
      this.requestOpen(false, 'outside')
    }
  }

  private onCloseButton() {
    this.requestOpen(false, 'close-button')
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
            <button type="button" class="lu-icon-button close" aria-label=${this.closeLabel} @click=${this.onCloseButton}>
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
