const notExported = new Set(['CustomEvent', 'Record', 'Array', 'ReadonlyArray'])

export function elementsOf(manifest) {
  return manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.customElement && declaration.tagName)
    .map((declaration) => ({
      tag: declaration.tagName,
      className: declaration.name,
      events: (declaration.events ?? []).map((event) => ({ name: event.name, type: event.type?.text ?? 'CustomEvent<unknown>' })),
      required: (declaration.members ?? []).filter((member) => member.kind === 'field' && member.required).map((member) => member.name),
    }))
    .sort((left, right) => left.tag.localeCompare(right.tag))
}

function pascal(name) {
  return name.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())
}

export function componentName(tag) {
  return `${pascal(tag.replace(/^lu-/, ''))}Element`
}

export function reactEventProp(event) {
  return `on${pascal(event.replace(/^lu-/, ''))}`
}

export function vueEventProp(event) {
  return `on${pascal(event)}`
}

function keys(names) {
  return names.map((name) => `'${name}'`).join(' | ')
}

function typeNames(elements) {
  const names = elements.flatMap((element) => element.events.flatMap((event) => event.type.match(/\b[A-Z]\w*/g) ?? []))
  return [...new Set(names)].filter((name) => !notExported.has(name)).sort()
}

function classNames(elements) {
  return [...new Set(elements.map((element) => element.className))].sort()
}

export function reactElements(manifest) {
  const elements = elementsOf(manifest)
  const imports = [...typeNames(elements).map((name) => `type ${name}`), ...classNames(elements)].join(', ')
  const components = elements.map(({ tag, className, events, required }) => {
    const handlers = events.map((event) => `${reactEventProp(event.name)}: '${event.name}' as EventName<${event.type}>`).join(', ')
    const eventMap = handlers ? `, events: { ${handlers} }` : ''
    const component = `createComponent({ tagName: '${tag}', elementClass: ${className}, react: React${eventMap} })`
    return `export const ${componentName(tag)} = ${required.length ? `requiring<${keys(required)}>()(${component})` : component}`
  })
  return [
    `import { createComponent, type EventName } from '@lit/react'`,
    `import * as React from 'react'`,
    `import { ${imports} } from '../index'`,
    '',
    'type Requiring<Props, Keys extends PropertyKey> = Omit<Props, Keys> & { [Key in Keys & keyof Props]-?: NonNullable<Props[Key]> }',
    '',
    'function requiring<Keys extends string>() {',
    '  return <Props>(component: React.ForwardRefExoticComponent<Props>) => component as React.ForwardRefExoticComponent<Requiring<Props, Keys>>',
    '}',
    '',
    ...components,
    '',
  ].join('\n')
}

export function vueElements(manifest) {
  const elements = elementsOf(manifest)
  const imports = [...typeNames(elements), ...classNames(elements)].join(', ')
  const entries = elements.map(({ tag, className, events, required }) => {
    const handlers = events.map((event) => `${vueEventProp(event.name)}?: (event: ${event.type}) => void`).join('; ')
    const parameters = [className, handlers ? `{ ${handlers} }` : 'object', required.length ? keys(required) : ''].filter(Boolean)
    return `    '${tag}': Element<${parameters.join(', ').replace(/, object$/, '')}>`
  })
  return [
    `import type { DefineComponent } from 'vue'`,
    `import type { ${imports} } from '../index'`,
    '',
    'type Element<Props, Events = object, Required extends keyof Props = never> = DefineComponent<Partial<Omit<Props, keyof HTMLElement | Required>> & Pick<Props, Required> & Events>',
    '',
    `export type LumenElementTag = ${elements.map(({ tag }) => `'${tag}'`).join(' | ')}`,
    '',
    `declare module 'vue' {`,
    '  interface GlobalComponents {',
    ...entries,
    '  }',
    '}',
    '',
  ].join('\n')
}
