import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import './icon'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('lu-icon', () => {
  it('draws a known icon and hides it from assistive technologies', async () => {
    const icon = await mount<HTMLElement & { updateComplete: Promise<boolean> }>('<lu-icon name="close"></lu-icon>')
    expect(icon.shadowRoot?.querySelector('svg')).not.toBeNull()
    expect(icon.getAttribute('aria-hidden')).toBe('true')
  })
})
