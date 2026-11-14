import { describe, expect, it } from 'vitest'
import { declarationOf } from './deprecated'
import { markRequired } from './required'

const manifest = {
  modules: [
    {
      declarations: [
        {
          tagName: 'lu-fixture',
          members: [{ name: 'label', required: true }, { name: 'value' }],
          attributes: [{ name: 'label', required: true }, { name: 'value' }],
        },
      ],
    },
  ],
}

const argTypes = {
  label: { name: 'label', type: { name: 'string' as const }, table: { category: 'attributes' } },
  value: { name: 'value', type: { name: 'string' as const }, table: { category: 'attributes' } },
}

describe('markRequired', () => {
  it('marks what the manifest says is required, and leaves the rest alone', () => {
    const marked = markRequired(argTypes, declarationOf(manifest, 'lu-fixture'))
    expect(marked.label).toEqual({ name: 'label', type: { name: 'string', required: true }, table: { category: 'attributes' } })
    expect(marked.value).toEqual(argTypes.value)
  })

  it('leaves the arg types of an unknown component alone', () => {
    expect(markRequired(argTypes, declarationOf(manifest, 'lu-other'))).toBe(argTypes)
  })
})
