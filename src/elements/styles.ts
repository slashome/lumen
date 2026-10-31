import { css, unsafeCSS } from 'lit'
import buttonCss from '../css/button.css?inline'
import lightCss from '../css/light.css?inline'
import markdownCss from '../css/markdown.css?inline'
import markCss from '../css/mark.css?inline'

export const buttonStyles = unsafeCSS(buttonCss)
export const lightStyles = unsafeCSS(lightCss)
export const markdownStyles = unsafeCSS(markdownCss)
export const markStyles = unsafeCSS(markCss)

export const popoverStyles = css`
  [popover] {
    position: fixed;
    inset: auto;
    margin: 0;
    border: 1px solid var(--lumen-color-border);
    border-radius: var(--lumen-radius-md);
    background: var(--lumen-color-popover);
    color: var(--lumen-color-foreground);
    font-family: var(--lumen-font-family-sans);
    font-size: var(--lumen-font-size-sm);
    box-shadow: var(--lumen-shadow-lg);
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
