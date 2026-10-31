import DOMPurify from 'dompurify'
import { css, html, LitElement } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { marked } from 'marked'
import { emit } from '../lib/emit'
import { define } from './define'
import { markdownStyles } from './styles'
import './icon'

export type LinkTarget = { kind: 'external'; href: string } | { kind: 'internal'; href: string } | { kind: 'unresolved'; title?: string }

export type LinkResolver = (href: string) => LinkTarget

export interface NavigateDetail {
  href: string
}

function isModified(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

export class LumenMarkdown extends LitElement {
  static properties = {
    source: {},
    resolveLink: { attribute: false },
  }

  static styles = [
    markdownStyles,
    css`
      :host {
        display: block;
      }

      .external {
        --lumen-icon-size: 0.75rem;
        margin-inline-start: 0.125rem;
        vertical-align: baseline;
      }

      .unresolved {
        color: var(--lumen-color-muted-foreground);
        text-decoration: underline dotted;
      }
    `,
  ]

  declare source: string
  declare resolveLink: LinkResolver | undefined

  constructor() {
    super()
    this.source = ''
    this.resolveLink = undefined
  }

  private renderHtml(): string {
    const parsed = marked.parse(this.source, { gfm: true, async: false })
    const clean = DOMPurify.sanitize(parsed)
    const resolve = this.resolveLink
    if (!resolve) {
      return clean
    }
    const template = document.createElement('template')
    template.innerHTML = clean
    template.content.querySelectorAll('a[href]').forEach((anchor) => this.rewrite(anchor as HTMLAnchorElement, resolve(anchor.getAttribute('href') ?? '')))
    return template.innerHTML
  }

  private rewrite(anchor: HTMLAnchorElement, target: LinkTarget) {
    if (target.kind === 'external') {
      anchor.href = target.href
      anchor.target = '_blank'
      anchor.rel = 'noreferrer'
      anchor.insertAdjacentHTML('beforeend', '<lumen-icon class="external" name="external-link"></lumen-icon>')
    } else if (target.kind === 'internal') {
      anchor.href = target.href
      anchor.dataset.lumenInternal = ''
    } else {
      const span = document.createElement('span')
      span.className = 'unresolved'
      span.title = target.title ?? anchor.getAttribute('href') ?? ''
      span.append(...anchor.childNodes)
      anchor.replaceWith(span)
    }
  }

  private onClick(event: MouseEvent) {
    const anchor = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
    if (!anchor || !('lumenInternal' in anchor.dataset) || isModified(event)) {
      return
    }
    event.preventDefault()
    emit<NavigateDetail>(this, 'lumen-navigate', { href: anchor.getAttribute('href') ?? '' })
  }

  render() {
    return html`<div class="lumen-markdown" part="body" @click=${this.onClick}>${unsafeHTML(this.renderHtml())}</div>`
  }
}

define('lumen-markdown', LumenMarkdown)

declare global {
  interface HTMLElementTagNameMap {
    'lumen-markdown': LumenMarkdown
  }
}
