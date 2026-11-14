import StyleDictionary from 'style-dictionary'
import { formattedVariables } from 'style-dictionary/utils'
import { isRelativeColor, resolveRelativeColor } from './relative-color.js'

const prefix = 'lu'

export function deprecationNote(token) {
  const reason = typeof token.$deprecated === 'string' ? ` ${token.$deprecated}` : ''
  return [`Deprecated.${reason}`, token.$description].filter(Boolean).join(' ')
}

function isDeprecated(token) {
  return token.$deprecated !== undefined && token.$deprecated !== false
}

function withDeprecation(token) {
  return isDeprecated(token) ? { ...token, $description: deprecationNote(token) } : token
}

function requireDescriptions(dictionary) {
  const undescribed = dictionary.allTokens
    .filter((token) => !token.filePath.includes('primitive') && !token.filePath.includes('semantic/dark') && !token.$description)
    .map((token) => token.name)
  if (undescribed.length > 0) {
    throw new Error(`tokens: semantic tokens without a $description: ${undescribed.join(', ')}`)
  }
}

function declarations(dictionary, keep) {
  const kept = keep ? dictionary.allTokens.filter(keep) : dictionary.allTokens
  const allTokens = kept.map(withDeprecation)
  return formattedVariables({ format: 'css', dictionary: { ...dictionary, allTokens }, outputReferences: true, usesDtcg: true })
}

function originalValue(token) {
  return String(token.original?.$value ?? '')
}

export function needsFallback(token) {
  const value = originalValue(token)
  return isRelativeColor(value) || value.includes('{theme.')
}

function fallbackValue(token) {
  return isRelativeColor(token.$value) ? resolveRelativeColor(token.$value) : token.$value
}

function fallbacks(dictionary) {
  return dictionary.allTokens
    .filter(needsFallback)
    .map((token) => `  --${token.name}: ${fallbackValue(token)};`)
    .join('\n')
}

export async function render(source, keep) {
  const dictionary = new StyleDictionary({
    source,
    usesDtcg: true,
    log: { verbosity: 'silent' },
    platforms: { css: { prefix, transforms: ['name/kebab'] } },
  })
  const platform = await dictionary.getPlatformTokens('css')
  requireDescriptions(platform)
  return {
    css: declarations(platform, keep),
    fallback: fallbacks(platform),
    deprecated: platform.allTokens.filter((token) => (keep ? keep(token) : true) && isDeprecated(token)).map((token) => `--${token.name}`),
  }
}
