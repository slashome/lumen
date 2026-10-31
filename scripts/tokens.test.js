import { readFileSync } from 'node:fs'
import Color from 'colorjs.io'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/foundations/tokens.css', 'utf8')
const [main, fallback] = css.split('@supports not (color: oklch(from red l c h)) {')

function blocks(part) {
  return new Map(
    [...part.matchAll(/(:root[^{]*)\{([^}]*)\}/g)].map(([, selector, body]) => [
      selector.trim(),
      new Map([...body.matchAll(/(--lu-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])),
    ]),
  )
}

const mainBlocks = blocks(main)
const fallbackBlocks = blocks(fallback ?? '')
const relative = (declarations) => [...declarations].filter(([, value]) => value.includes('oklch(from')).map(([name]) => name)

describe('tokens.css', () => {
  it('has a fallback block for browsers without relative colors', () => {
    expect(fallback).toBeDefined()
    expect([...fallbackBlocks.keys()]).toEqual([...mainBlocks.keys()])
  })

  it.each([...mainBlocks.keys()])('gives every relative color of %s a fallback value', (selector) => {
    const effective = new Set([...relative(mainBlocks.get(':root')), ...relative(mainBlocks.get(selector))])
    expect(effective.size).toBeGreaterThan(0)
    const fallbacks = fallbackBlocks.get(selector)
    for (const name of effective) {
      expect(fallbacks.get(name), name).toBeDefined()
    }
  })

  it('writes fallback values that are colors without relative syntax', () => {
    for (const declarations of fallbackBlocks.values()) {
      for (const [name, value] of declarations) {
        expect(value, name).not.toContain('from')
        expect(() => new Color(value), name).not.toThrow()
      }
    }
  })
})
