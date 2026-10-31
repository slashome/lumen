import { create, ts } from '@custom-elements-manifest/analyzer'
import { litPlugin } from '@custom-elements-manifest/analyzer/src/features/framework-plugins/lit/lit.js'
import { describe, expect, it } from 'vitest'
import { deprecatedInClassTags, publicApiOnly, taggedElementsOnly } from './manifest-plugins.js'

const source = `
import { LitElement } from 'lit'

/**
 * @summary A fixture.
 * @tag lu-fixture
 * @slot - The content.
 * @slot old - The former content slot. @deprecated Use the default slot.
 * @fires {CustomEvent<{ value: string }>} lu-value-change - The value changed.
 * @fires {CustomEvent<{ value: string }>} lu-change - The value changed. @deprecated Listen to lu-value-change.
 */
export class LumenFixture extends LitElement {
  static properties = {
    value: {},
    tone: {},
    expanded: { state: true },
  }

  /** The value. */
  declare value: string
  /**
   * The tone.
   * @deprecated Use value.
   */
  declare tone: string
  declare private expanded: boolean
}
`

function analyze() {
  const module = ts.createSourceFile('src/fixture.ts', source, ts.ScriptTarget.ES2023, true)
  const manifest = create({ modules: [module], plugins: [...litPlugin(), publicApiOnly(), deprecatedInClassTags()] })
  return manifest.modules[0].declarations[0]
}

describe('manifest plugins', () => {
  it('keeps internal state out of the attributes and the members', () => {
    const element = analyze()
    expect(element.attributes.map((attribute) => attribute.name)).toEqual(['value', 'tone'])
    expect(element.members.map((member) => member.name)).toEqual(['value', 'tone'])
  })

  it('carries @deprecated from a property to its attribute', () => {
    const element = analyze()
    expect(element.members.find((member) => member.name === 'tone')).toMatchObject({ deprecated: 'Use value.' })
    expect(element.attributes.find((attribute) => attribute.name === 'tone')).toMatchObject({ deprecated: 'Use value.' })
    expect(element.members.find((member) => member.name === 'value').deprecated).toBeUndefined()
  })

  it('reads @deprecated at the end of an @fires or @slot line', () => {
    const element = analyze()
    expect(element.events).toEqual([
      { name: 'lu-value-change', type: { text: 'CustomEvent<{ value: string }>' }, description: 'The value changed.' },
      { name: 'lu-change', type: { text: 'CustomEvent<{ value: string }>' }, description: 'The value changed.', deprecated: 'Listen to lu-value-change.' },
    ])
    expect(element.slots.find((slot) => slot.name === 'old')).toEqual({ name: 'old', description: 'The former content slot.', deprecated: 'Use the default slot.' })
  })

  it('drops an untagged base class and keeps what its elements inherit from it', () => {
    const inherited = `
import { LitElement } from 'lit'

export class LumenBase extends LitElement {
  static properties = { open: { type: Boolean } }

  /** Whether it is open. */
  declare open: boolean
}

/**
 * @summary A fixture.
 * @tag lu-fixture
 */
export class LumenFixture extends LumenBase {}
`
    const module = ts.createSourceFile('src/fixture.ts', inherited, ts.ScriptTarget.ES2023, true)
    const manifest = create({ modules: [module], plugins: [...litPlugin(), publicApiOnly(), taggedElementsOnly()] })
    expect(manifest.modules[0].declarations.map((declaration) => declaration.name)).toEqual(['LumenFixture'])
    expect(manifest.modules[0].exports.map((entry) => entry.name)).toEqual(['LumenFixture'])
    expect(manifest.modules[0].declarations[0].attributes.map((attribute) => attribute.name)).toEqual(['open'])
  })
})
