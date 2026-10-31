import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { ValueChangeDetail } from '../../lib/change'
import type { ComboboxValue, LumenCombobox, SearchDetail } from './combobox'
import type { LumenTag } from '../tag/tag'
import './combobox'

afterEach(() => {
  document.body.innerHTML = ''
})

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'cafe', label: 'Café' },
]

async function combobox(markup = '<lu-combobox label="Fruit"></lu-combobox>', options = fruits) {
  const element = await mount<LumenCombobox>(markup)
  element.options = options
  await element.updateComplete
  return element
}

function input(element: LumenCombobox) {
  return element.shadowRoot!.querySelector('input')!
}

async function type(element: LumenCombobox, text: string) {
  input(element).value = text
  input(element).dispatchEvent(new Event('input', { bubbles: true }))
  await element.updateComplete
}

async function press(element: LumenCombobox, key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  input(element).dispatchEvent(event)
  await element.updateComplete
  return event
}

function shown(element: LumenCombobox) {
  return [...element.shadowRoot!.querySelectorAll('[role="option"]')].map((option) => option.textContent?.trim())
}

function activeOption(element: LumenCombobox) {
  const id = input(element).getAttribute('aria-activedescendant')
  return id ? element.shadowRoot!.getElementById(id)?.textContent?.trim() : undefined
}

function record<Detail>(element: LumenCombobox, name: string) {
  const details: Detail[] = []
  element.addEventListener(name, (event) => details.push((event as CustomEvent<Detail>).detail))
  return details
}

describe('lu-combobox', () => {
  it('is a combobox input that controls its listbox, named by label', async () => {
    const element = await combobox()
    const field = input(element)
    expect(field.getAttribute('role')).toBe('combobox')
    expect(field.getAttribute('aria-label')).toBe('Fruit')
    expect(field.getAttribute('aria-autocomplete')).toBe('list')
    expect(field.getAttribute('aria-expanded')).toBe('false')
    expect(element.shadowRoot!.getElementById(field.getAttribute('aria-controls')!)?.getAttribute('role')).toBe('listbox')
  })

  it('filters its options by the text typed, ignoring case and accents, and fires lu-search', async () => {
    const element = await combobox()
    const searches = record<SearchDetail>(element, 'lu-search')
    await type(element, 'AP')
    expect(shown(element)).toEqual(['Apple', 'Apricot'])
    expect(input(element).getAttribute('aria-expanded')).toBe('true')
    await type(element, 'cafe')
    expect(shown(element)).toEqual(['Café'])
    expect(searches).toEqual([{ query: 'AP' }, { query: 'cafe' }])
  })

  it('moves the active option with the arrow keys, Home and End, and picks it with Enter', async () => {
    const element = await combobox()
    const changes = record<ValueChangeDetail<ComboboxValue>>(element, 'lu-value-change')
    await press(element, 'ArrowDown')
    expect(activeOption(element)).toBe('Apple')
    await press(element, 'ArrowDown')
    expect(activeOption(element)).toBe('Apricot')
    await press(element, 'End')
    expect(activeOption(element)).toBe('Café')
    await press(element, 'Home')
    expect(activeOption(element)).toBe('Apple')
    await press(element, 'ArrowUp')
    expect(activeOption(element)).toBe('Apple')
    await press(element, 'Enter')
    expect(changes).toEqual([{ value: 'apple', source: 'option' }])
    expect(element.value).toBe('apple')
    expect(input(element).value).toBe('Apple')
    expect(input(element).getAttribute('aria-expanded')).toBe('false')
  })

  it('activates the first match as the user types, and Escape closes the list and drops the text', async () => {
    const element = await combobox()
    element.value = 'banana'
    await element.updateComplete
    expect(input(element).value).toBe('Banana')
    await type(element, 'apr')
    expect(activeOption(element)).toBe('Apricot')
    const escape = await press(element, 'Escape')
    expect(escape.defaultPrevented).toBe(true)
    expect(input(element).getAttribute('aria-expanded')).toBe('false')
    expect(input(element).value).toBe('Banana')
    expect(element.value).toBe('banana')
  })

  it('keeps its value when a listener cancels lu-value-change', async () => {
    const element = await combobox()
    const seen: ComboboxValue[] = []
    element.addEventListener('lu-value-change', (event) => {
      seen.push(element.value)
      event.preventDefault()
    })
    await type(element, 'ban')
    await press(element, 'Enter')
    expect(seen).toEqual([''])
    expect(element.value).toBe('')
    expect(input(element).value).toBe('')
  })

  it('offers to create a value no option matches, with the comboboxCreate message', async () => {
    const element = await combobox('<lu-combobox label="Fruit" creatable></lu-combobox>')
    const changes = record<ValueChangeDetail<ComboboxValue>>(element, 'lu-value-change')
    await type(element, 'apple')
    expect(shown(element)).toEqual(['Apple'])
    await type(element, 'Mango')
    expect(shown(element)).toEqual(['Create “Mango”'])
    expect(element.shadowRoot!.querySelector('.message')?.textContent).toBe('No results')
    await press(element, 'Enter')
    expect(changes).toEqual([{ value: 'Mango', source: 'create' }])
    expect(input(element).value).toBe('Mango')
  })

  it('shows the options as given with skip-filter, and the loading message while loading', async () => {
    const element = await combobox('<lu-combobox label="Fruit" skip-filter></lu-combobox>')
    await type(element, 'zz')
    expect(shown(element)).toEqual(['Apple', 'Apricot', 'Banana', 'Café'])
    element.loading = true
    await element.updateComplete
    expect(shown(element)).toEqual([])
    expect(element.shadowRoot!.querySelector('.message')?.textContent).toBe('Loading…')
    element.options = [{ value: 'kiwi', label: 'Kiwi' }]
    element.loading = false
    await element.updateComplete
    expect(shown(element)).toEqual(['Kiwi'])
    expect(activeOption(element)).toBe('Kiwi')
    expect(element.shadowRoot!.querySelector('[role="status"]')?.textContent).toBe('1 result.')
  })

  it('announces the number of results, or that there is none', async () => {
    const element = await combobox()
    const status = () => element.shadowRoot!.querySelector('[role="status"]')?.textContent
    await type(element, 'a')
    expect(status()).toBe('4 results.')
    await type(element, 'xyz')
    expect(status()).toBe('No results')
  })

  it('holds several values as removable tags with multiple, and keeps the list open', async () => {
    const element = await combobox('<lu-combobox label="Fruits" multiple></lu-combobox>')
    element.value = ['apple']
    await element.updateComplete
    const changes = record<ValueChangeDetail<ComboboxValue>>(element, 'lu-value-change')
    await type(element, 'ban')
    await press(element, 'Enter')
    expect(changes).toEqual([{ value: ['apple', 'banana'], source: 'option' }])
    expect(input(element).value).toBe('')
    expect(input(element).getAttribute('aria-expanded')).toBe('true')
    expect(element.shadowRoot!.querySelector('[role="listbox"]')?.getAttribute('aria-multiselectable')).toBe('true')
    const tags = [...element.shadowRoot!.querySelectorAll<LumenTag>('lu-tag')]
    expect(tags.map((tag) => tag.textContent)).toEqual(['Apple', 'Banana'])
    await Promise.all(tags.map((tag) => tag.updateComplete))
    tags[0]!.shadowRoot!.querySelector<HTMLButtonElement>('[part="remove"]')!.click()
    await element.updateComplete
    expect(changes.at(-1)).toEqual({ value: ['banana'], source: 'remove' })
    await press(element, 'Backspace')
    expect(changes.at(-1)).toEqual({ value: [], source: 'remove' })
  })

  it('does not let lu-remove of its tags reach the page', async () => {
    const element = await combobox('<lu-combobox label="Fruits" multiple></lu-combobox>')
    element.value = ['apple']
    await element.updateComplete
    const removes = record<unknown>(element, 'lu-remove')
    const tag = element.shadowRoot!.querySelector<LumenTag>('lu-tag')!
    await tag.updateComplete
    tag.shadowRoot!.querySelector<HTMLButtonElement>('[part="remove"]')!.click()
    expect(removes).toEqual([])
  })

  it('takes a JSON array in its value attribute', async () => {
    const element = await combobox(`<lu-combobox label="Fruits" multiple value='["apple","kiwi"]'></lu-combobox>`)
    expect(element.value).toEqual(['apple', 'kiwi'])
    expect([...element.shadowRoot!.querySelectorAll('lu-tag')].map((tag) => tag.textContent)).toEqual(['Apple', 'kiwi'])
  })

  it('clears a single value when its text is emptied and left', async () => {
    const element = await combobox()
    element.value = 'apple'
    await element.updateComplete
    const changes = record<ValueChangeDetail<ComboboxValue>>(element, 'lu-value-change')
    await type(element, '')
    input(element).dispatchEvent(new Event('blur'))
    await element.updateComplete
    expect(changes).toEqual([{ value: '', source: 'clear' }])
    expect(element.value).toBe('')
  })

  it('ignores the user while disabled', async () => {
    const element = await combobox('<lu-combobox label="Fruit" disabled></lu-combobox>')
    await press(element, 'ArrowDown')
    expect(input(element).disabled).toBe(true)
    expect(input(element).getAttribute('aria-expanded')).toBe('false')
  })
})
