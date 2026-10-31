import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { LumenSelect } from './select'
import './select'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('lu-select', () => {
  it('marks the option of its value and shows its label', async () => {
    const select = await mount<LumenSelect>(
      '<lu-select label="Status" value="b"><lu-option value="a">Alpha</lu-option><lu-option value="b" text-value="Beta">β</lu-option></lu-select>',
    )
    await select.updateComplete
    const options = select.options
    expect(options.map((option) => option.selected)).toEqual([false, true])
    expect(select.shadowRoot!.querySelector('.value')?.textContent).toContain('Beta')
  })
})

describe('lu-select in a page without the popover API', () => {
  it('opens its list and chooses an option', async () => {
    const select = await mount<LumenSelect>('<lu-select label="Status" value="a"><lu-option value="a">Alpha</lu-option><lu-option value="b">Beta</lu-option></lu-select>')
    await select.updateComplete
    const values: string[] = []
    select.addEventListener('lu-value-change', (event) => values.push((event as CustomEvent<{ value: string }>).detail.value))
    const trigger = select.shadowRoot!.querySelector<HTMLButtonElement>('[role="combobox"]')!
    trigger.click()
    select.options[1]!.click()
    expect(values).toEqual(['b'])
  })
})
