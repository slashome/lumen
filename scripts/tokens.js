#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { render } from './token-css.js'

const destination = 'src/foundations/tokens.css'
const darkSelectors = [":root[data-appearance='dark']", "@media (prefers-color-scheme: dark) { :root:not([data-appearance]) {"]
const relativeColorSupport = 'color: oklch(from red l c h)'

function onlyFrom(directory) {
  return (token) => token.filePath.includes(directory)
}

const shared = ['tokens/primitive/**/*.json', 'tokens/semantic/base/**/*.json', 'tokens/semantic/light/**/*.json']
const light = await render(shared)
const dark = await render([...shared, 'tokens/semantic/dark/**/*.json'], onlyFrom('semantic/dark'))

const css = [
  '@layer lu.tokens {',
  `:root {\n${light.css}\n}`,
  `${darkSelectors[0]} {\n${dark.css}\n}`,
  `${darkSelectors[1]}\n${dark.css}\n} }`,
  `@supports not (${relativeColorSupport}) {`,
  `:root {\n${light.fallback}\n}`,
  `${darkSelectors[0]} {\n${dark.fallback}\n}`,
  `${darkSelectors[1]}\n${dark.fallback}\n} }`,
  '}',
  '}',
  '',
].join('\n')

await mkdir('src/foundations', { recursive: true })
await writeFile(destination, css)
console.log(`tokens: ${destination}`)

const deprecated = [...new Set([...light.deprecated, ...dark.deprecated])]
if (deprecated.length > 0) {
  console.warn(`tokens: deprecated, to be removed in the next major version: ${deprecated.join(', ')}`)
}
