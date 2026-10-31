import { css } from 'lit'
import { define } from './define'
import { LumenDialog } from './dialog'

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
