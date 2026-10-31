import StyleDictionary from 'style-dictionary'
import { formattedVariables } from 'style-dictionary/utils'

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
    deprecated: platform.allTokens.filter((token) => (keep ? keep(token) : true) && isDeprecated(token)).map((token) => `--${token.name}`),
  }
}
