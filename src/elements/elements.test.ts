import { afterEach, describe, expect, it, vi } from 'vitest'
import '../index'
import { highlightTerms } from '../lib/highlight-terms'
import type { LumenHighlight } from './highlight'
import type { LumenMarkdown } from './markdown'
import type { LumenMultiSelect } from './multi-select'
import type { LumenSegmented } from './segmented'
import type { LumenSelect } from './select'

async function mount<Element extends HTMLElement & { updateComplete: Promise<boolean> }>(markup: string): Promise<Element> {
  document.body.innerHTML = markup
  const element = document.body.firstElementChild as Element
  await element.updateComplete
  return element
}

afterEach(() => {
  document.body.innerHTML = ''
  highlightTerms.set([])
})

describe('lumen-icon', () => {
  it('draws a known icon and hides it from assistive technologies', async () => {
    const icon = await mount<HTMLElement & { updateComplete: Promise<boolean> }>('<lumen-icon name="close"></lumen-icon>')
    expect(icon.shadowRoot?.querySelector('svg')).not.toBeNull()
    expect(icon.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('lumen-segmented', () => {
  it('presses a value, and unsets it when pressed again', async () => {
    const segmented = await mount<LumenSegmented>('<lumen-segmented label="Size"></lumen-segmented>')
    segmented.values = ['S', 'M']
    await segmented.updateComplete
    const changes: (string | null)[] = []
    segmented.addEventListener('lumen-value-change', (event) => changes.push((event as CustomEvent<{ value: string | null }>).detail.value))
    const [small] = segmented.shadowRoot!.querySelectorAll('button')
    small!.click()
    await segmented.updateComplete
    small!.click()
    expect(changes).toEqual(['S', null])
  })
})

describe('lumen-select', () => {
  it('marks the option of its value and shows its label', async () => {
    const select = await mount<LumenSelect>(
      '<lumen-select label="Status" value="b"><lumen-option value="a">Alpha</lumen-option><lumen-option value="b" text-value="Beta">β</lumen-option></lumen-select>',
    )
    await select.updateComplete
    const options = select.options
    expect(options.map((option) => option.selected)).toEqual([false, true])
    expect(select.shadowRoot!.querySelector('.value')?.textContent).toContain('Beta')
  })
})

describe('lumen-multi-select', () => {
  it('adds and removes a value on each toggle', async () => {
    const select = await mount<LumenMultiSelect>('<lumen-multi-select label="Kind"></lumen-multi-select>')
    select.options = [
      { value: 'task', label: 'Task' },
      { value: 'story', label: 'Story' },
    ]
    await select.updateComplete
    const listener = vi.fn()
    select.addEventListener('lumen-selected-change', (event) => listener((event as CustomEvent<{ selected: string[] }>).detail.selected))
    const items = select.shadowRoot!.querySelectorAll<HTMLButtonElement>('.item')
    items[1]!.click()
    await select.updateComplete
    items[0]!.click()
    expect(listener.mock.calls.map(([selected]) => selected)).toEqual([['story'], ['story', 'task']])
  })
})

describe('lumen-highlight', () => {
  it('marks the shared terms, case and accents ignored', async () => {
    highlightTerms.set(['ete'])
    const highlight = await mount<LumenHighlight>('<lumen-highlight text="Un Été chaud"></lumen-highlight>')
    expect([...highlight.shadowRoot!.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual(['Été'])
  })
})

describe('lumen-markdown', () => {
  it('sanitises the HTML of the source', async () => {
    const markdown = await mount<LumenMarkdown>('<lumen-markdown></lumen-markdown>')
    markdown.source = '# Title\n\n<img src=x onerror="alert(1)">'
    await markdown.updateComplete
    const body = markdown.shadowRoot!.querySelector('.lumen-markdown')!
    expect(body.querySelector('h1')?.textContent).toBe('Title')
    expect(body.innerHTML).not.toContain('onerror')
  })

  it('turns links into external, internal or unresolved ones', async () => {
    const markdown = await mount<LumenMarkdown>('<lumen-markdown></lumen-markdown>')
    markdown.resolveLink = (href) =>
      href.startsWith('http') ? { kind: 'external', href } : href === 'T1.md' ? { kind: 'internal', href: '/items/T1' } : { kind: 'unresolved', title: href }
    markdown.source = '[out](https://example.org) [in](T1.md) [lost](T9.md)'
    await markdown.updateComplete
    const body = markdown.shadowRoot!.querySelector('.lumen-markdown')!
    const [external, internal] = body.querySelectorAll('a')
    expect(external?.getAttribute('target')).toBe('_blank')
    expect(internal?.getAttribute('href')).toBe('/items/T1')
    expect(body.querySelector('.unresolved')?.getAttribute('title')).toBe('T9.md')

    const navigations: string[] = []
    markdown.addEventListener('lumen-navigate', (event) => navigations.push((event as CustomEvent<{ href: string }>).detail.href))
    internal?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0 }))
    expect(navigations).toEqual(['/items/T1'])
  })
})
