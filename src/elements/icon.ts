import { css, html, LitElement, nothing, svg } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { iconData, onIconsRegistered } from '../lib/icons'
import { define } from './define'

export class LumenIcon extends LitElement {
  static properties = {
    name: { reflect: true },
    label: {},
  }

  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
      inline-size: var(--lu-icon-size, 1em);
      block-size: var(--lu-icon-size, 1em);
      line-height: 0;
      vertical-align: -0.125em;
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
    }
  `

  declare name: string
  declare label: string
  private stopListening?: () => void

  constructor() {
    super()
    this.name = ''
    this.label = ''
  }

  connectedCallback() {
    super.connectedCallback()
    this.stopListening = onIconsRegistered(() => this.requestUpdate())
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
    const data = iconData(this.name)
    if (!data) {
      return nothing
    }
    return html`<svg viewBox="0 0 ${data.width} ${data.height}" xmlns="http://www.w3.org/2000/svg" part="svg">${svg`${unsafeSVG(data.body)}`}</svg>`
  }
}

define('lu-icon', LumenIcon)

declare global {
  interface HTMLElementTagNameMap {
    'lu-icon': LumenIcon
  }
}
