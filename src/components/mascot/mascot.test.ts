import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import { registerMascot } from '../../lib/mascots'
import { fairy } from './fairy'
import type { LumenMascot } from './mascot'
import './mascot'

afterEach(() => {
  document.body.innerHTML = ''
  registerMascot(fairy)
})

describe('lu-mascot', () => {
  it('draws the Lumen fairy by default, with its named groups', async () => {
    const mascot = await mount<LumenMascot>('<lu-mascot></lu-mascot>')
    const drawing = mascot.shadowRoot?.querySelector('svg')
    expect(drawing?.getAttribute('viewBox')).toBe('0 0 64 64')
    expect(['glow', 'body', 'wing-left', 'wing-right', 'sparkles'].map((id) => drawing?.querySelector(`#${id}`) !== null)).toEqual([true, true, true, true, true])
  })

  it('draws the empty variant without glow or sparkles', async () => {
    const mascot = await mount<LumenMascot>('<lu-mascot variant="empty"></lu-mascot>')
    const drawing = mascot.shadowRoot?.querySelector('svg')
    expect(drawing?.querySelector('#body')).not.toBeNull()
    expect(drawing?.querySelector('#glow')).toBeNull()
    expect(drawing?.querySelector('#sparkles')).toBeNull()
  })

  it('redraws with the mascot the application registers in its place', async () => {
    const mascot = await mount<LumenMascot>('<lu-mascot></lu-mascot>')
    registerMascot({ default: { body: '<circle id="owl" cx="8" cy="8" r="8"/>', width: 16, height: 16 } })
    await mascot.updateComplete
    const drawing = mascot.shadowRoot?.querySelector('svg')
    expect(drawing?.getAttribute('viewBox')).toBe('0 0 16 16')
    expect(drawing?.querySelector('#owl')).not.toBeNull()
  })

  it('draws nothing for a variant with no drawing', async () => {
    const mascot = await mount<LumenMascot>('<lu-mascot variant="sleeping"></lu-mascot>')
    expect(mascot.shadowRoot?.querySelector('svg')).toBeNull()
  })

  it('is decorative without a label, and an image named by its label', async () => {
    const mascot = await mount<LumenMascot>('<lu-mascot></lu-mascot>')
    expect(mascot.getAttribute('aria-hidden')).toBe('true')
    expect(mascot.hasAttribute('role')).toBe(false)
    mascot.label = 'Lumen'
    await mascot.updateComplete
    expect(mascot.getAttribute('role')).toBe('img')
    expect(mascot.getAttribute('aria-label')).toBe('Lumen')
    expect(mascot.hasAttribute('aria-hidden')).toBe(false)
  })
})
