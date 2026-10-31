import { css, html, LitElement, type PropertyValues } from 'lit'
import type { OpenChangeDetail, OpenChangeSource } from '../../lib/change'
import { emit } from '../../lib/emit'

export class LumenModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: {},
    description: {},
    slottedDescription: { state: true },
  }

  static styles = [
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
    `,
  ]

  /** Whether the dialog is shown, as a modal. The dialog clears it when the user closes it, unless `lu-open-change` is cancelled. */
  declare open: boolean
  /** The title of the dialog, which also names it for assistive technology. */
  declare heading: string
  /** A sentence under the title, which also describes the dialog for assistive technology. */
  declare description: string
  declare protected slottedDescription: boolean
  private forcedEscape = false

  constructor() {
    super()
    this.open = false
    this.heading = ''
    this.description = ''
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
}
