import { css, unsafeCSS } from 'lit'
import buttonCss from '../css/button.css?inline'
import lightCss from '../css/light.css?inline'

export const buttonStyles = unsafeCSS(buttonCss)
export const lightStyles = unsafeCSS(lightCss)

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

export const visuallyHidden = css`
  .visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
`
