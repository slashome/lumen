import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { LumenTag, RemoveDetail } from './tag'
import './tag'

afterEach(() => {
  document.body.innerHTML = ''
})

function removeButton(tag: LumenTag) {
  return tag.shadowRoot!.querySelector<HTMLButtonElement>('[part="remove"]')
}

function record(tag: LumenTag) {
  const events: CustomEvent<RemoveDetail>[] = []
  tag.addEventListener('lu-remove', (event) => events.push(event as CustomEvent<RemoveDetail>))
  return events
}

describe('lu-tag', () => {
  it('draws no remove button unless removable', async () => {
    const tag = await mount<LumenTag>('<lu-tag>Design</lu-tag>')
    expect(removeButton(tag)).toBeNull()
    tag.removable = true
    await tag.updateComplete
    expect(removeButton(tag)).not.toBeNull()
  })

  it('names its remove button with the tagRemove message and its text', async () => {
    const tag = await mount<LumenTag>('<lu-tag removable>Design</lu-tag>')
    await tag.updateComplete
    expect(removeButton(tag)!.getAttribute('aria-label')).toBe('Remove Design')
  })

  it('fires lu-remove with its value on a click, and stays in place', async () => {
    const tag = await mount<LumenTag>('<lu-tag removable value="design">Design</lu-tag>')
    const events = record(tag)
    removeButton(tag)!.click()
    expect(events.map((event) => [event.detail, event.cancelable, event.bubbles, event.composed])).toEqual([[{ value: 'design' }, false, true, true]])
    expect(tag.isConnected).toBe(true)
  })

  it('fires lu-remove on Delete and Backspace, with its text when it has no value', async () => {
    const tag = await mount<LumenTag>('<lu-tag removable>Design</lu-tag>')
    const events = record(tag)
    for (const key of ['Delete', 'Backspace', 'Enter', 'a']) {
      removeButton(tag)!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    }
    expect(events.map((event) => event.detail)).toEqual([{ value: 'Design' }, { value: 'Design' }])
  })

  it('fires nothing while disabled', async () => {
    const tag = await mount<LumenTag>('<lu-tag removable disabled>Design</lu-tag>')
    const events = record(tag)
    removeButton(tag)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }))
    expect(removeButton(tag)!.disabled).toBe(true)
    expect(events).toEqual([])
  })
})
