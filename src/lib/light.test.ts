import { afterEach, describe, expect, it } from 'vitest'
import { attachLight } from './light'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('attachLight', () => {
  it('lights a button on click, but not a busy or disabled one', () => {
    document.body.innerHTML = `
      <button class="lu-button" id="ready">Save</button>
      <button class="lu-button" id="busy" aria-busy="true" aria-disabled="true">Save</button>
      <a class="lu-button" id="off" aria-disabled="true">Items</a>
    `
    const detach = attachLight()
    for (const id of ['ready', 'busy', 'off']) {
      document.getElementById(id)!.click()
    }
    detach()
    expect(document.getElementById('ready')!.hasAttribute('data-lu-lit')).toBe(true)
    expect(document.getElementById('busy')!.hasAttribute('data-lu-lit')).toBe(false)
    expect(document.getElementById('off')!.hasAttribute('data-lu-lit')).toBe(false)
  })
})
