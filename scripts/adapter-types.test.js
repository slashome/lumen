import { describe, expect, it } from 'vitest'
import { componentName, reactElements, reactEventProp, vueElements, vueEventProp } from './adapter-types.js'

const manifest = {
  modules: [
    {
      declarations: [
        {
          kind: 'class',
          customElement: true,
          tagName: 'lu-select',
          name: 'LumenSelect',
          events: [{ name: 'lu-value-change', type: { text: 'CustomEvent<ValueChangeDetail>' } }],
          members: [
            { kind: 'field', name: 'label', required: true },
            { kind: 'field', name: 'value' },
          ],
        },
        { kind: 'class', customElement: true, tagName: 'lu-icon', name: 'LumenIcon' },
        { kind: 'class', name: 'NotAnElement' },
      ],
    },
  ],
}

describe('adapter types', () => {
  it('names the React component and its event props after the tag and the events', () => {
    expect(componentName('lu-confirm-dialog')).toBe('ConfirmDialogElement')
    expect(reactEventProp('lu-open-change')).toBe('onOpenChange')
    expect(vueEventProp('lu-open-change')).toBe('onLuOpenChange')
  })

  it('wraps every element of the manifest for React, with its typed events', () => {
    const source = reactElements(manifest)
    expect(source).toContain("import { type ValueChangeDetail, LumenIcon, LumenSelect } from '../index'")
    expect(source).toContain("export const IconElement = createComponent({ tagName: 'lu-icon', elementClass: LumenIcon, react: React })")
    expect(source).toContain("events: { onValueChange: 'lu-value-change' as EventName<CustomEvent<ValueChangeDetail>> }")
    expect(source).not.toContain('NotAnElement')
    expect(source).toContain("export const SelectElement = requiring<'label'>()(createComponent({ tagName: 'lu-select'")
  })

  it('declares every element of the manifest as a Vue global component, with its typed events', () => {
    const source = vueElements(manifest)
    expect(source).toContain("export type LumenElementTag = 'lu-icon' | 'lu-select'")
    expect(source).toContain("'lu-select': Element<LumenSelect, { onLuValueChange?: (event: CustomEvent<ValueChangeDetail>) => void }, 'label'>")
    expect(source).toContain("'lu-icon': Element<LumenIcon>")
  })
})
