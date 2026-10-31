#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import StyleDictionary from 'style-dictionary'
import { formattedVariables } from 'style-dictionary/utils'

const destination = 'src/foundations/tokens.css'
const prefix = 'lu'
const darkSelectors = [":root[data-appearance='dark']", "@media (prefers-color-scheme: dark) { :root:not([data-appearance]) {"]

function onlyFrom(directory) {
  return (token) => token.filePath.includes(directory)
}

function declarations(dictionary, keep) {
  const allTokens = keep ? dictionary.allTokens.filter(keep) : dictionary.allTokens
  return formattedVariables({ format: 'css', dictionary: { ...dictionary, allTokens }, outputReferences: true, usesDtcg: true })
}

function requireDescriptions(dictionary) {
  const undescribed = dictionary.allTokens
    .filter((token) => !token.filePath.includes('primitive') && !token.filePath.includes('semantic/dark') && !token.$description)
    .map((token) => token.name)
  if (undescribed.length > 0) {
    throw new Error(`tokens: semantic tokens without a $description: ${undescribed.join(', ')}`)
  }
}

async function render(source, keep) {
  const dictionary = new StyleDictionary({
    source,
    usesDtcg: true,
    log: { verbosity: 'silent' },
    platforms: { css: { prefix, transforms: ['name/kebab'] } },
  })
  const platform = await dictionary.getPlatformTokens('css')
  requireDescriptions(platform)
  return declarations(platform, keep)
}

const shared = ['tokens/primitive/**/*.json', 'tokens/semantic/base/**/*.json', 'tokens/semantic/light/**/*.json']
const light = await render(shared)
const dark = await render([...shared, 'tokens/semantic/dark/**/*.json'], onlyFrom('semantic/dark'))

const css = [
  '@layer lu.tokens {',
  `:root {\n${light}\n}`,
  `${darkSelectors[0]} {\n${dark}\n}`,
  `${darkSelectors[1]}\n${dark}\n} }`,
  '}',
  '',
].join('\n')

await mkdir('src/foundations', { recursive: true })
await writeFile(destination, css)
console.log(`tokens: ${destination}`)
