import { describe, expect, it } from 'vitest'
import manifest from '../custom-elements.json'

interface Described {
  name: string
  description?: string
  type?: { text: string }
}

interface Element {
  tagName?: string
  customElement?: boolean
  summary?: string
  description?: string
  attributes?: Described[]
  members?: (Described & { kind: string })[]
  events?: Described[]
  slots?: Described[]
  cssParts?: Described[]
  cssProperties?: Described[]
}

const elements = (manifest.modules as { declarations?: Element[] }[]).flatMap((module) => module.declarations ?? []).filter((declaration) => declaration.customElement)

function undescribed(items: Described[] | undefined): string[] {
  return (items ?? []).filter((item) => !item.description?.trim()).map((item) => item.name || '(default)')
}

describe('custom-elements.json', () => {
  it('lists every element under its lu- tag', () => {
    expect(elements.map((element) => element.tagName).sort()).toEqual([
      'lu-confirm-dialog',
      'lu-dialog',
      'lu-drag-area',
      'lu-draggable',
      'lu-drop-zone',
      'lu-highlight',
      'lu-hover-card',
      'lu-icon',
      'lu-markdown',
      'lu-multi-select',
      'lu-option',
      'lu-segmented',
      'lu-select',
      'lu-sheet',
      'lu-tabs',
      'lu-toaster',
      'lu-tooltip',
    ])
  })

  it.each(elements.map((element) => [element.tagName, element] as const))('describes the public API of %s', (_, element) => {
    expect(element.summary?.trim()).toBeTruthy()
    expect(element.description?.trim()).toBeTruthy()
    expect({
      attributes: undescribed(element.attributes),
      properties: undescribed(element.members?.filter((member) => member.kind === 'field')),
      events: undescribed(element.events),
      slots: undescribed(element.slots),
      cssParts: undescribed(element.cssParts),
      cssProperties: undescribed(element.cssProperties),
    }).toEqual({ attributes: [], properties: [], events: [], slots: [], cssParts: [], cssProperties: [] })
  })

  it('types the detail of every event and names it lu-*', () => {
    for (const event of elements.flatMap((element) => element.events ?? [])) {
      expect(event.name).toMatch(/^lu-[a-z-]+$/)
      expect(event.type?.text).toMatch(/^CustomEvent<.+>$/)
    }
  })

  it('gives lu-confirm-dialog no close-label, which it has no button for', () => {
    const confirm = elements.find((element) => element.tagName === 'lu-confirm-dialog')
    expect(confirm?.attributes?.map((attribute) => attribute.name)).not.toContain('close-label')
  })
})
