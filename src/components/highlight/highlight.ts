import { html, LitElement } from 'lit'
import { highlightRanges, splitByRanges, type Range } from '../../lib/highlight'
import { highlightTerms } from '../../lib/highlight-terms'
import { define } from '../../lib/define'

/**
 * Renders a text with the matches of search terms wrapped in `<mark class="lu-mark">`, into the light DOM. Matching ignores case and accents.
 *
 * Without `terms` or `ranges`, it follows the page-wide terms set with `highlightTerms` from `@slashome/lumen/lib`.
 *
 * @summary A text with its search matches marked.
 * @tag lu-highlight
 */
export class LumenHighlight extends LitElement {
  static properties = {
    text: {},
    terms: { type: Array },
    ranges: { type: Array },
  }

  /** The text to render. */
  declare text: string
  /** The terms to mark. Overrides the page-wide terms. */
  declare terms: readonly string[] | undefined
  /** The exact ranges to mark, as `[start, end]` offsets in `text`, end excluded. Overrides `terms`. */
  declare ranges: readonly Range[] | undefined
  private stopListening?: () => void

  constructor() {
    super()
    this.text = ''
    this.terms = undefined
    this.ranges = undefined
  }

  protected createRenderRoot() {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    this.stopListening = highlightTerms.subscribe(() => this.requestUpdate())
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopListening?.()
  }

  render() {
    const ranges = this.ranges ?? highlightRanges(this.text, this.terms ?? highlightTerms.get())
    return splitByRanges(this.text, ranges).map((segment) => (segment.match ? html`<mark class="lu-mark">${segment.text}</mark>` : segment.text))
  }
}

define('lu-highlight', LumenHighlight)

declare global {
  interface HTMLElementTagNameMap {
    'lu-highlight': LumenHighlight
  }
}
