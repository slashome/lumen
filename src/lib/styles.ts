import { css, unsafeCSS } from 'lit'
import buttonCss from '../components/button/button.css?inline'
import lightCss from '../foundations/light.css?inline'
import utilitiesCss from '../foundations/utilities.css?inline'

export const buttonStyles = unsafeCSS(buttonCss)
export const lightStyles = unsafeCSS(lightCss)
export const utilityStyles = unsafeCSS(utilitiesCss)

export const popoverStyles = css`
  [popover] {
    position: fixed;
    inset: auto;
    margin: 0;
    border: 1px solid var(--lu-color-border);
    border-radius: var(--lu-radius-md);
    background: var(--lu-color-popover);
    color: var(--lu-color-foreground);
    font-family: var(--lu-font-family-sans);
    font-size: var(--lu-font-size-sm);
    box-shadow: var(--lu-shadow-lg);
  }
`
