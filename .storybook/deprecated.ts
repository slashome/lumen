import type { ArgTypes } from '@storybook/web-components-vite'

interface Item {
  name: string
  deprecated?: boolean | string
  required?: boolean
}

export interface Declaration {
  tagName?: string
  members?: Item[]
  attributes?: Item[]
  events?: Item[]
  slots?: Item[]
  cssParts?: Item[]
  cssProperties?: Item[]
}

interface Manifest {
  modules: { declarations?: Declaration[] }[]
}

export const deprecatedCategory = 'Deprecated'

export function declarationOf(manifest: Manifest, tagName: unknown): Declaration | undefined {
  return manifest.modules.flatMap((module) => module.declarations ?? []).find((declaration) => declaration.tagName === tagName)
}

function deprecations(declaration: Declaration): Map<string, string> {
  const lists = [declaration.members, declaration.attributes, declaration.events, declaration.slots, declaration.cssParts, declaration.cssProperties]
  const entries = lists.flatMap((items) => items ?? []).filter((item) => item.deprecated !== undefined && item.deprecated !== false)
  return new Map(entries.map((item) => [item.name, typeof item.deprecated === 'string' ? item.deprecated : '']))
}

export function markDeprecated(argTypes: ArgTypes, declaration: Declaration | undefined): ArgTypes {
  if (!declaration) return argTypes
  const deprecated = deprecations(declaration)
  return Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => {
      const reason = deprecated.get(name)
      if (reason === undefined) return [name, argType]
      const description = [`**Deprecated.** ${reason}`.trim(), argType.description].filter(Boolean).join(' ')
      return [name, { ...argType, description, table: { ...argType.table, category: deprecatedCategory } }]
    }),
  )
}
