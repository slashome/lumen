import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { LumenTabs } from './tabs'
import './tabs'

afterEach(() => {
  document.body.innerHTML = ''
})

const markup = (attributes = '') => `
  <lu-tabs label="Item" ${attributes}>
    <button slot="tab" value="overview">Overview</button>
    <button slot="tab" value="history">History</button>
    <button slot="tab" value="links" disabled>Links</button>
    <button slot="tab" value="files">Files</button>
    <div>Overview panel</div>
    <div>History panel</div>
    <div>Links panel</div>
    <div>Files panel</div>
  </lu-tabs>
`

function parts(tabs: LumenTabs) {
  return {
    tabs: [...tabs.querySelectorAll<HTMLButtonElement>('[slot="tab"]')],
    panels: [...tabs.querySelectorAll<HTMLElement>(':scope > div')],
  }
}

function press(tab: HTMLElement, key: string) {
  tab.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))
}

describe('lu-tabs', () => {
  it('links each tab to its panel and selects the first one by default', async () => {
    const tabs = await mount<LumenTabs>(markup())
    const { tabs: [overview, history], panels: [first, second] } = parts(tabs)
    expect(tabs.shadowRoot!.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Item')
    expect(overview!.getAttribute('role')).toBe('tab')
    expect(overview!.getAttribute('aria-selected')).toBe('true')
    expect(overview!.tabIndex).toBe(0)
    expect(history!.tabIndex).toBe(-1)
    expect(overview!.type).toBe('button')
    expect(overview!.getAttribute('aria-controls')).toBe(first!.id)
    expect(first!.getAttribute('role')).toBe('tabpanel')
    expect(first!.getAttribute('aria-labelledby')).toBe(overview!.id)
    expect(first!.hidden).toBe(false)
    expect(second!.hidden).toBe(true)
  })

  it('selects a clicked tab and fires lu-value-change', async () => {
    const tabs = await mount<LumenTabs>(markup())
    const values: string[] = []
    tabs.addEventListener('lu-value-change', (event) => values.push((event as CustomEvent<{ value: string }>).detail.value))
    parts(tabs).tabs[1]!.click()
    await tabs.updateComplete
    expect(values).toEqual(['history'])
    expect(tabs.value).toBe('history')
    expect(parts(tabs).panels[1]!.hidden).toBe(false)
  })

  it('keeps its value when a listener cancels lu-value-change', async () => {
    const tabs = await mount<LumenTabs>(markup('value="history"'))
    const seen: (string | null)[] = []
    tabs.addEventListener('lu-value-change', (event) => {
      seen.push(tabs.value)
      event.preventDefault()
    })
    parts(tabs).tabs[0]!.click()
    await tabs.updateComplete
    expect(seen).toEqual(['history'])
    expect(tabs.value).toBe('history')
  })

  it('selects the focused tab with the arrows, Home and End, skipping disabled tabs', async () => {
    const tabs = await mount<LumenTabs>(markup())
    const [overview, history, , files] = parts(tabs).tabs
    press(overview!, 'ArrowRight')
    await tabs.updateComplete
    expect(tabs.value).toBe('history')
    press(history!, 'ArrowRight')
    await tabs.updateComplete
    expect(tabs.value).toBe('files')
    expect(document.activeElement).toBe(files)
    press(files!, 'ArrowRight')
    await tabs.updateComplete
    expect(tabs.value).toBe('overview')
    press(overview!, 'ArrowLeft')
    await tabs.updateComplete
    expect(tabs.value).toBe('files')
    press(files!, 'Home')
    await tabs.updateComplete
    expect(tabs.value).toBe('overview')
    press(overview!, 'End')
    await tabs.updateComplete
    expect(tabs.value).toBe('files')
  })

  it('only moves the focus with the arrows when manual', async () => {
    const tabs = await mount<LumenTabs>(markup('manual'))
    const [overview, history] = parts(tabs).tabs
    press(overview!, 'ArrowRight')
    await tabs.updateComplete
    expect(document.activeElement).toBe(history)
    expect(tabs.value).toBeNull()
    expect(overview!.getAttribute('aria-selected')).toBe('true')
    history!.click()
    await tabs.updateComplete
    expect(tabs.value).toBe('history')
  })
})
