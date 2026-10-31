import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '../../testing/mount'
import type { LumenMultiSelect } from './multi-select'
import './multi-select'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('lu-multi-select', () => {
  it('adds and removes a value on each toggle', async () => {
    const select = await mount<LumenMultiSelect>('<lu-multi-select label="Kind"></lu-multi-select>')
    select.options = [
      { value: 'task', label: 'Task' },
      { value: 'story', label: 'Story' },
    ]
    await select.updateComplete
    const listener = vi.fn()
    select.addEventListener('lu-selected-change', (event) => listener((event as CustomEvent<{ selected: string[] }>).detail.selected))
    const items = select.shadowRoot!.querySelectorAll<HTMLButtonElement>('.item')
    items[1]!.click()
    await select.updateComplete
    items[0]!.click()
    expect(listener.mock.calls.map(([selected]) => selected)).toEqual([['story'], ['story', 'task']])
  })

  it('keeps its selection when a listener cancels lu-selected-change', async () => {
    const select = await mount<LumenMultiSelect>('<lu-multi-select label="Kind"></lu-multi-select>')
    select.options = [
      { value: 'task', label: 'Task' },
      { value: 'story', label: 'Story' },
    ]
    select.selected = ['task']
    await select.updateComplete
    const seen: string[][] = []
    select.addEventListener('lu-selected-change', (event) => {
      seen.push(select.selected)
      event.preventDefault()
    })
    select.shadowRoot!.querySelectorAll<HTMLButtonElement>('.item')[1]!.click()
    await select.updateComplete
    expect(seen).toEqual([['task']])
    expect(select.selected).toEqual(['task'])
  })

  it('says whether an item was toggled or the selection cleared', async () => {
    const select = await mount<LumenMultiSelect>('<lu-multi-select label="Kind"></lu-multi-select>')
    select.options = [{ value: 'task', label: 'Task' }]
    await select.updateComplete
    const sources: string[] = []
    select.addEventListener('lu-selected-change', (event) => sources.push((event as CustomEvent<{ source: string }>).detail.source))
    select.shadowRoot!.querySelector<HTMLButtonElement>('.item')!.click()
    await select.updateComplete
    select.shadowRoot!.querySelector<HTMLButtonElement>('.clear')!.click()
    expect(sources).toEqual(['option', 'clear'])
  })
})
