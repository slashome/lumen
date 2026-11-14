import { defineComponent, h, mergeProps, type ComponentObjectPropsOptions, type PropType } from 'vue'

type Model = 'open' | 'value' | 'selected'

const modelEvents: Record<Model, string> = {
  open: 'onLuOpenChange',
  value: 'onLuValueChange',
  selected: 'onLuSelectedChange',
}

const modelProps = {
  open: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  value: { type: null as unknown as PropType<string | null | undefined>, default: undefined },
  selected: { type: Array as PropType<string[] | undefined>, default: undefined },
}

const comboboxValueProp = {
  value: { type: null as unknown as PropType<string | string[] | undefined>, default: undefined },
}

const labelProps = {
  label: { type: String, required: true },
} as const

type RequiredProps = typeof labelProps | Record<never, never>

function modelled<Name extends Model, Required extends RequiredProps = Record<never, never>, Own extends ComponentObjectPropsOptions = Pick<typeof modelProps, Name>>(
  tag: string,
  model: Name,
  required = {} as Required,
  own = { [model]: modelProps[model] } as Own,
) {
  return defineComponent({
    name: tag.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase()),
    inheritAttrs: false,
    props: { ...required, ...own } as Required & Own,
    emits: [`update:${model}`],
    setup(props, { attrs, slots, emit }) {
      return () => {
        const values = props as Record<string, unknown>
        const current = values[model]
        const controlled = current !== undefined
        const given = Object.fromEntries(Object.keys(required).map((name) => [name, values[name]]))
        const listener = (event: CustomEvent<Record<Model, unknown>>) => {
          if (controlled) {
            event.preventDefault()
          }
          emit(`update:${model}`, event.detail[model])
        }
        return h(tag, mergeProps(attrs, given, controlled ? { [model]: current } : {}, { [modelEvents[model]]: listener }), slots.default?.())
      }
    },
  })
}

export const LuDialog = modelled('lu-dialog', 'open')
export const LuSheet = modelled('lu-sheet', 'open')
export const LuConfirmDialog = modelled('lu-confirm-dialog', 'open')
export const LuTooltip = modelled('lu-tooltip', 'open')
export const LuHoverCard = modelled('lu-hover-card', 'open')
export const LuSelect = modelled('lu-select', 'value', labelProps)
export const LuSegmented = modelled('lu-segmented', 'value', labelProps)
export const LuTabs = modelled('lu-tabs', 'value', labelProps)
export const LuMultiSelect = modelled('lu-multi-select', 'selected', labelProps)
export const LuCombobox = modelled('lu-combobox', 'value', labelProps, comboboxValueProp)
