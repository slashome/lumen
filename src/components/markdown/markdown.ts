import DOMPurify from 'dompurify'
import { html, LitElement } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { marked } from 'marked'
import { emit } from '../../lib/emit'
import { define } from '../../lib/define'
import '../icon/icon'

export type LinkTarget = { kind: 'external'; href: string } | { kind: 'internal'; href: string } | { kind: 'unresolved'; title?: string }

export type LinkResolver = (href: string) => LinkTarget

export interface NavigateDetail {
  href: string
}

function isModified(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

/**
 * Renders GitHub-flavored Markdown, sanitized with DOMPurify, into the light DOM so the page can search, select and style it with `.lu-markdown`.
 *
 * With `resolveLink`, each link is rewritten as external (new tab, with an icon), internal (a click fires `lu-navigate` instead of following it) or unresolved (plain text).
 *
 * @summary Sanitized Markdown, with links the application resolves.
 * @tag lu-markdown
 * @fires {CustomEvent<NavigateDetail>} lu-navigate - The user clicked an internal link without a modifier key. The default navigation is prevented; `detail.href` is the link.
 */
export class LumenMarkdown extends LitElement {
  static properties = {
    source: {},
    resolveLink: { attribute: false },
  }

  /** The Markdown to render. */
  declare source: string
  /** Decides what each link of the source points to. Without it, links stay as written. */
  declare resolveLink: LinkResolver | undefined

  constructor() {
    super()
    this.source = ''
    this.resolveLink = undefined
  }

  protected createRenderRoot() {
    return this
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
      anchor.insertAdjacentHTML('beforeend', '<lu-icon class="lu-markdown__external" name="external-link"></lu-icon>')
    } else if (target.kind === 'internal') {
      anchor.href = target.href
      anchor.dataset.luInternal = ''
    } else {
      const span = document.createElement('span')
      span.className = 'lu-markdown__unresolved'
      span.title = target.title ?? anchor.getAttribute('href') ?? ''
      span.append(...anchor.childNodes)
      anchor.replaceWith(span)
    }
  }

  private onClick(event: MouseEvent) {
    const anchor = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
    if (!anchor || !('luInternal' in anchor.dataset) || isModified(event)) {
      return
    }
    event.preventDefault()
    emit<NavigateDetail>(this, 'lu-navigate', { href: anchor.getAttribute('href') ?? '' })
  }

  render() {
    return html`<div class="lu-markdown" @click=${this.onClick}>${unsafeHTML(this.renderHtml())}</div>`
  }
}

define('lu-markdown', LumenMarkdown)

declare global {
  interface HTMLElementTagNameMap {
    'lu-markdown': LumenMarkdown
  }
}
