import { describe, expect, it } from 'vitest'
import { isRelativeColor, resolveRelativeColor } from './relative-color.js'

describe('relative color', () => {
  it('recognises the relative oklch syntax', () => {
    expect(isRelativeColor('oklch(from #3760c9 l c h)')).toBe(true)
    expect(isRelativeColor('oklch(0.5 0.1 260)')).toBe(false)
    expect(isRelativeColor('color-mix(in oklab, red 10%, transparent)')).toBe(false)
  })

  it('keeps the channels it does not change', () => {
    expect(resolveRelativeColor('oklch(from oklch(0.924 0.12 95.746) l c h / 0.8)')).toBe('oklch(0.924 0.12 95.746 / 0.8)')
  })

  it('evaluates min, max and clamp on the channels', () => {
    expect(resolveRelativeColor('oklch(from oklch(0.4 0.3 200) max(l, 0.66) min(c, 0.17) h)')).toBe('oklch(0.66 0.17 200)')
    expect(resolveRelativeColor('oklch(from oklch(0.4 0.3 200) clamp(0, (0.62 - l) * 1000, 1) 0 0)')).toBe('oklch(1 0 0)')
    expect(resolveRelativeColor('oklch(from oklch(0.7 0.1 200) clamp(0, (0.62 - l) * 1000, 1) 0 0)')).toBe('oklch(0 0 0)')
  })

  it('converts a hex origin and resolves a nested relative color', () => {
    expect(resolveRelativeColor('oklch(from #ffffff l c h)')).toBe('oklch(1 0 0)')
    expect(resolveRelativeColor('oklch(from oklch(from oklch(0.3 0.1 120) max(l, 0.8) c h) clamp(0, (0.62 - l) * 1000, 1) 0 0)')).toBe('oklch(0 0 0)')
  })

  it('refuses what it cannot evaluate rather than guess', () => {
    expect(() => resolveRelativeColor('oklch(from #fff sin(l) c h)')).toThrow(/unknown function 'sin'/)
    expect(() => resolveRelativeColor('oklch(from #fff 50% c h)')).toThrow(/cannot evaluate '%'/)
  })
})
