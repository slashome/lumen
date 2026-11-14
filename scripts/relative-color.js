import Color from 'colorjs.io'

const functions = {
  min: (...values) => Math.min(...values),
  max: (...values) => Math.max(...values),
  clamp: (low, value, high) => Math.max(low, Math.min(value, high)),
  calc: (value) => value,
}

export function isRelativeColor(value) {
  return typeof value === 'string' && /\boklch\(\s*from\s/.test(value)
}

function splitTopLevel(text) {
  const parts = []
  let depth = 0
  let current = ''
  for (const character of text) {
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (/\s/.test(character) && depth === 0) {
      if (current) parts.push(current)
      current = ''
    } else {
      current += character
    }
  }
  if (current) parts.push(current)
  return parts
}

function tokenize(expression) {
  const tokens = expression.match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[-+*/(),]|\S/gi) ?? []
  const unknown = tokens.find((token) => !/^(\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[-+*/(),])$/i.test(token))
  if (unknown) throw new Error(`relative color: cannot evaluate '${unknown}' in '${expression}'`)
  return tokens
}

function evaluate(expression, channels) {
  const tokens = tokenize(expression)
  let position = 0
  const peek = () => tokens[position]
  const take = (expected) => {
    const token = tokens[position++]
    if (expected && token !== expected) throw new Error(`relative color: expected '${expected}' in '${expression}'`)
    return token
  }

  function sum() {
    let value = product()
    while (peek() === '+' || peek() === '-') value = take() === '+' ? value + product() : value - product()
    return value
  }

  function product() {
    let value = factor()
    while (peek() === '*' || peek() === '/') value = take() === '*' ? value * factor() : value / factor()
    return value
  }

  function call(name) {
    const fn = functions[name]
    if (!fn) throw new Error(`relative color: unknown function '${name}' in '${expression}'`)
    take('(')
    const args = [sum()]
    while (peek() === ',') {
      take(',')
      args.push(sum())
    }
    take(')')
    return fn(...args)
  }

  function factor() {
    const token = take()
    if (token === '-') return -factor()
    if (token === '(') {
      const value = sum()
      take(')')
      return value
    }
    if (/^[\d.]/.test(token)) return Number(token)
    if (peek() === '(') return call(token)
    if (token in channels) return channels[token]
    throw new Error(`relative color: unknown keyword '${token}' in '${expression}'`)
  }

  const value = sum()
  if (position !== tokens.length) throw new Error(`relative color: unexpected '${peek()}' in '${expression}'`)
  return value
}

function channelsOf(value) {
  const text = value.trim()
  const relative = /^oklch\(\s*from\s+([\s\S]*)\)$/.exec(text)
  if (!relative) {
    const color = new Color(text).to('oklch')
    const [l, c, h] = color.coords
    return { l, c, h: Number.isNaN(h) ? 0 : h, alpha: color.alpha }
  }
  const [origin, ...rest] = splitTopLevel(relative[1])
  const slash = rest.indexOf('/')
  const components = slash === -1 ? rest : rest.slice(0, slash)
  const alpha = slash === -1 ? 'alpha' : rest[slash + 1]
  if (components.length !== 3) throw new Error(`relative color: expected three channels in '${text}'`)
  const base = channelsOf(origin)
  const [l, c, h, a] = [...components, alpha].map((expression) => evaluate(expression, base))
  return { l: Math.min(Math.max(l, 0), 1), c: Math.max(c, 0), h: ((h % 360) + 360) % 360, alpha: Math.min(Math.max(a, 0), 1) }
}

function round(value, digits) {
  return Number(value.toFixed(digits))
}

export function resolveRelativeColor(value) {
  const { l, c, h, alpha } = channelsOf(value)
  const opacity = alpha < 1 ? ` / ${round(alpha, 3)}` : ''
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 3)}${opacity})`
}
