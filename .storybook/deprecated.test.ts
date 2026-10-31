import { describe, expect, it } from 'vitest'
import { declarationOf, markDeprecated } from './deprecated'

const manifest = {
  modules: [
    {
      declarations: [
        {
          tagName: 'lu-fixture',
          members: [{ name: 'value' }, { name: 'tone', deprecated: 'Use value.' }],
          attributes: [{ name: 'value' }, { name: 'tone', deprecated: 'Use value.' }],
          events: [{ name: 'lu-change', deprecated: true }],
        },
      ],
    },
  ],
}

const argTypes = {
  value: { name: 'value', description: 'The value.', table: { category: 'attributes' } },
  tone: { name: 'tone', description: 'The tone.', table: { category: 'attributes' } },
  'lu-change': { name: 'lu-change', description: 'The value changed.', table: { category: 'events' } },
}

describe('markDeprecated', () => {
  it('moves what the manifest marks @deprecated to the Deprecated category, with its reason', () => {
    const marked = markDeprecated(argTypes, declarationOf(manifest, 'lu-fixture'))
    expect(marked.value).toEqual(argTypes.value)
    expect(marked.tone).toEqual({ name: 'tone', description: '**Deprecated.** Use value. The tone.', table: { category: 'Deprecated' } })
    expect(marked['lu-change']).toEqual({ name: 'lu-change', description: '**Deprecated.** The value changed.', table: { category: 'Deprecated' } })
  })

  it('leaves the arg types of an unknown component alone', () => {
    expect(markDeprecated(argTypes, declarationOf(manifest, 'lu-other'))).toBe(argTypes)
  })
})
