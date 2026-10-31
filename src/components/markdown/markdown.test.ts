import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { LumenMarkdown } from './markdown'
import './markdown'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('lu-markdown', () => {
  it('sanitises the HTML of the source', async () => {
    const markdown = await mount<LumenMarkdown>('<lu-markdown></lu-markdown>')
    markdown.source = '# Title\n\n<img src=x onerror="alert(1)">'
    await markdown.updateComplete
    const body = markdown.querySelector('.lu-markdown')!
    expect(body.querySelector('h1')?.textContent).toBe('Title')
    expect(body.innerHTML).not.toContain('onerror')
  })

  it('turns links into external, internal or unresolved ones', async () => {
    const markdown = await mount<LumenMarkdown>('<lu-markdown></lu-markdown>')
    markdown.resolveLink = (href) =>
      href.startsWith('http') ? { kind: 'external', href } : href === 'T1.md' ? { kind: 'internal', href: '/items/T1' } : { kind: 'unresolved', title: href }
    markdown.source = '[out](https://example.org) [in](T1.md) [lost](T9.md)'
    await markdown.updateComplete
    const body = markdown.querySelector('.lu-markdown')!
    const [external, internal] = body.querySelectorAll('a')
    expect(external?.getAttribute('target')).toBe('_blank')
    expect(internal?.getAttribute('href')).toBe('/items/T1')
    expect(body.querySelector('.lu-markdown__unresolved')?.getAttribute('title')).toBe('T9.md')

    const navigations: string[] = []
    markdown.addEventListener('lu-navigate', (event) => navigations.push((event as CustomEvent<{ href: string }>).detail.href))
    internal?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0 }))
    expect(navigations).toEqual(['/items/T1'])
  })
})
