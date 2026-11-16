import { css } from 'lit'
import { define } from '../../lib/define'
import { LumenDialog } from '../dialog/dialog'

export type { OpenChangeDetail } from '../../lib/change'

export type SheetPlacement = 'end' | 'bottom'

/**
 * A modal panel on the native `<dialog>`, docked to the inline end of the viewport at full height, or with `placement="bottom"` to the bottom at full width, as high as its content up to `--lu-sheet-height`. It scrolls its own content.
 *
 * It behaves as `lu-dialog`: it closes itself after a cancelable `lu-open-change`, which a listener cancels to control it.
 *
 * @fires {CustomEvent<OpenChangeDetail>} lu-open-change - The user asked to close the sheet. `detail.open` is `false`; `detail.source` is `escape`, `outside` (the backdrop), `close-button`, or `form` (a `<form method="dialog">` inside it). Cancelable: `preventDefault()` keeps the sheet open, and the element still holds `open` while the event runs.
 *
 * @summary A side panel for a detail view or a long form.
 * @tag lu-sheet
 * @cssprop --lu-sheet-width - The inline size of the sheet at the inline end, capped by the viewport. Defaults to 42rem.
 * @cssprop --lu-sheet-height - The maximum block size of the sheet at the bottom. Defaults to 85svh.
 */
export class LumenSheet extends LumenDialog {
  static properties = {
    ...LumenDialog.properties,
    placement: { reflect: true },
  }

  static styles = [
    ...LumenDialog.styles,
    css`
      dialog {
        inset-block: 0;
        inset-inline: auto 0;
        inline-size: var(--lu-sheet-width, 42rem);
        max-inline-size: 100%;
        block-size: 100%;
        max-block-size: 100%;
        margin: 0;
        border-block: 0;
        border-inline-end: 0;
        border-radius: 0;
      }

      :host([placement='bottom']) dialog {
        inset-block: auto 0;
        inset-inline: 0;
        inline-size: 100%;
        block-size: auto;
        max-block-size: var(--lu-sheet-height, 85svh);
        border-block-start: 1px solid var(--lu-color-border);
        border-block-end: 0;
        border-inline: 0;
        border-start-start-radius: var(--lu-radius-lg);
        border-start-end-radius: var(--lu-radius-lg);
      }

      :host([placement='bottom']) .panel {
        block-size: auto;
        max-block-size: inherit;
        padding-block-end: max(var(--lu-space-5), env(safe-area-inset-bottom));
      }

      .panel {
        gap: var(--lu-space-4);
        block-size: 100%;
        overflow-y: auto;
      }

      .title {
        white-space: normal;
      }
    `,
  ]

  /** The edge the sheet is docked to: `end`, the inline end at full height, or `bottom`, the bottom at full width. */
  declare placement: SheetPlacement

  constructor() {
    super()
    this.placement = 'end'
  }
}

define('lu-sheet', LumenSheet)

declare global {
  interface HTMLElementTagNameMap {
    'lu-sheet': LumenSheet
  }
}
