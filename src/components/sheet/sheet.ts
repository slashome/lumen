import { css } from 'lit'
import { define } from '../../lib/define'
import { LumenDialog } from '../dialog/dialog'

/**
 * A modal panel on the native `<dialog>`, docked to the inline end of the viewport at full height. It scrolls its own content.
 *
 * It behaves as `lu-dialog`: controlled through `open` and `lu-open-change`.
 *
 * @summary A side panel for a detail view or a long form.
 * @tag lu-sheet
 * @cssprop --lu-sheet-width - The inline size of the sheet, capped by the viewport. Defaults to 42rem.
 */
export class LumenSheet extends LumenDialog {
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
}

define('lu-sheet', LumenSheet)

declare global {
  interface HTMLElementTagNameMap {
    'lu-sheet': LumenSheet
  }
}
