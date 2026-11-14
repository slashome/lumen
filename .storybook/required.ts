import type { ArgTypes, InputType } from '@storybook/web-components-vite'
import type { Declaration } from './deprecated'

function requiredNames(declaration: Declaration): Set<string> {
  const items = [...(declaration.members ?? []), ...(declaration.attributes ?? [])]
  return new Set(items.filter((item) => item.required).map((item) => item.name))
}

function requiredType(type: InputType['type']): InputType['type'] {
  if (typeof type === 'object' && type !== null) {
    return { ...type, required: true }
  }
  return { name: type ?? 'string', required: true } as InputType['type']
}

export function markRequired(argTypes: ArgTypes, declaration: Declaration | undefined): ArgTypes {
  if (!declaration) return argTypes
  const required = requiredNames(declaration)
  return Object.fromEntries(Object.entries(argTypes).map(([name, argType]) => [name, required.has(name) ? { ...argType, type: requiredType(argType.type) } : argType]))
}
