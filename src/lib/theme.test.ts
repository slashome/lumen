import { afterEach, describe, expect, it } from 'vitest'
import { setLumenTheme } from './theme'

const root = document.documentElement

afterEach(() => {
  root.removeAttribute('style')
})

describe('setLumenTheme', () => {
  it('sets the primary and the secondary theme colors on the document root', () => {
    setLumenTheme({ primary: '#16a34a', secondary: '#c026d3' })
    expect(root.style.getPropertyValue('--lu-theme-primary')).toBe('#16a34a')
    expect(root.style.getPropertyValue('--lu-theme-secondary')).toBe('#c026d3')
  })

  it('sets only the colors it is given', () => {
    setLumenTheme({ secondary: '#c026d3' })
    setLumenTheme({ primary: '#16a34a' })
    expect(root.style.getPropertyValue('--lu-theme-primary')).toBe('#16a34a')
    expect(root.style.getPropertyValue('--lu-theme-secondary')).toBe('#c026d3')
  })

  it('replaces the colors when called again', () => {
    setLumenTheme({ primary: '#16a34a', secondary: '#16a34a' })
    setLumenTheme({ primary: '#ea580c', secondary: '#c026d3' })
    expect(root.style.getPropertyValue('--lu-theme-primary')).toBe('#ea580c')
    expect(root.style.getPropertyValue('--lu-theme-secondary')).toBe('#c026d3')
  })

  it('themes the element it is given instead of the document root', () => {
    const section = document.createElement('section')
    setLumenTheme({ primary: '#16a34a' }, section)
    expect(section.style.getPropertyValue('--lu-theme-primary')).toBe('#16a34a')
    expect(root.style.getPropertyValue('--lu-theme-primary')).toBe('')
  })
})
