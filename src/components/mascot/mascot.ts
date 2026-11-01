import { css, html, LitElement, nothing, svg } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { mascotData, onMascotRegistered, type LumenMascotVariant } from '../../lib/mascots'
import { define } from '../../lib/define'

/**
 * Draws the mascot of the application: the Lumen fairy, a winged light in the theme colors, until the application registers its own with `registerMascot()`. Its colors follow `--lu-theme-primary` and `--lu-theme-secondary`.
 *
 * Without a `label` the mascot is decorative and hidden from assistive technology; with one it is an image with that name.
 *
 * @summary The mascot of the application, drawn in the theme colors.
 * @tag lu-mascot
 * @csspart svg - The `<svg>` element.
 * @cssprop --lu-mascot-size - The inline and block size of the mascot. Defaults to 4rem.
 */
export class LumenMascot extends LitElement {
  static properties = {
    variant: { reflect: true },
    label: {},
  }

  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
      inline-size: var(--lu-mascot-size, 4rem);
      block-size: var(--lu-mascot-size, 4rem);
      line-height: 0;
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
      overflow: visible;
    }
  `

  /** The pose of the mascot: `default`, lit, or `empty`, a dotted outline for a place with nothing in it yet. A variant with no drawing registered draws nothing. */
  declare variant: LumenMascotVariant
  /** The accessible name of the mascot. Leave it empty when it is decorative. */
  declare label: string
  private stopListening?: () => void

  constructor() {
    super()
    this.variant = 'default'
    this.label = ''
  }

  connectedCallback() {
    super.connectedCallback()
    this.stopListening = onMascotRegistered(() => this.requestUpdate())
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopListening?.()
  }

  updated() {
    if (this.label) {
      this.setAttribute('role', 'img')
      this.setAttribute('aria-label', this.label)
      this.removeAttribute('aria-hidden')
    } else {
      this.removeAttribute('role')
      this.removeAttribute('aria-label')
      this.setAttribute('aria-hidden', 'true')
    }
  }

  render() {
    const data = mascotData(this.variant)
    if (!data) {
      return nothing
    }
    return html`<svg viewBox="0 0 ${data.width} ${data.height}" xmlns="http://www.w3.org/2000/svg" part="svg">${svg`${unsafeSVG(data.body)}`}</svg>`
  }
}

define('lu-mascot', LumenMascot)

declare global {
  interface HTMLElementTagNameMap {
    'lu-mascot': LumenMascot
  }
}
