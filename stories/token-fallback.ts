export type Declarations = [string, string][]

export interface TokenRules {
  light: Declarations
  dark: Declarations
  lightFallback: Declarations
  darkFallback: Declarations
}

const relativeColorSupport = 'oklch(from'

function declarationsOf(rule: CSSStyleRule): Declarations {
  return Array.from(rule.style)
    .filter((name) => name.startsWith('--lu-color-'))
    .map((name) => [name, rule.style.getPropertyValue(name).trim()])
}

function* styleRules(rules: CSSRuleList, inFallback = false): Generator<{ rule: CSSStyleRule; inFallback: boolean }> {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSMediaRule) continue
    if (rule instanceof CSSSupportsRule) {
      yield* styleRules(rule.cssRules, inFallback || rule.conditionText.includes(relativeColorSupport))
    } else if (rule instanceof CSSStyleRule) {
      yield { rule, inFallback }
    } else if (rule instanceof CSSGroupingRule) {
      yield* styleRules(rule.cssRules, inFallback)
    }
  }
}

function readableRules(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules
  } catch {
    return null
  }
}

export function tokenRules(): TokenRules {
  const found: TokenRules = { light: [], dark: [], lightFallback: [], darkFallback: [] }
  for (const sheet of Array.from(document.styleSheets)) {
    const rules = readableRules(sheet)
    if (!rules) continue
    for (const { rule, inFallback } of styleRules(rules)) {
      const declarations = declarationsOf(rule)
      if (declarations.length === 0) continue
      const selector = rule.selectorText.replace(/\s/g, '')
      if (selector === ':root') found[inFallback ? 'lightFallback' : 'light'].push(...declarations)
      if (selector === ':root[data-appearance="dark"]') found[inFallback ? 'darkFallback' : 'dark'].push(...declarations)
    }
  }
  return found
}

export function inlineStyle(declarations: Declarations): string {
  return declarations.map(([name, value]) => `${name}: ${value}`).join('; ')
}

const canvas = document.createElement('canvas')
canvas.width = 1
canvas.height = 1
const context = canvas.getContext('2d', { willReadFrequently: true })

export type Rgb = [number, number, number]

export function opaque(color: string, background: string): Rgb {
  if (!context) throw new Error('No 2D canvas context to read colors with')
  context.fillStyle = background
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const { data } = context.getImageData(0, 0, 1, 1)
  return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0]
}

function linear(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance([red, green, blue]: Rgb): number {
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
}

export function contrast(first: Rgb, second: Rgb): number {
  const [one, two] = [luminance(first), luminance(second)]
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05)
}
