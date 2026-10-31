import { html, LitElement } from 'lit'
import { highlightRanges, splitByRanges, type Range } from '../lib/highlight'
import { highlightTerms } from '../lib/highlight-terms'
import { define } from './define'

export class LumenHighlight extends LitElement {
  static properties = {
    text: {},
    terms: { type: Array },
    ranges: { type: Array },
  }

  declare text: string
  declare terms: readonly string[] | undefined
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
