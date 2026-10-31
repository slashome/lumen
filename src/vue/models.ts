import { defineComponent, h, mergeProps, type PropType } from 'vue'

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

function modelled<Name extends Model>(tag: string, model: Name) {
  return defineComponent({
    name: tag.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase()),
    inheritAttrs: false,
    props: { [model]: modelProps[model] } as Pick<typeof modelProps, Name>,
    emits: [`update:${model}`],
    setup(props, { attrs, slots, emit }) {
      return () => {
        const current = (props as Record<string, unknown>)[model]
        const controlled = current !== undefined
        const listener = (event: CustomEvent<Record<Model, unknown>>) => {
          if (controlled) {
            event.preventDefault()
          }
          emit(`update:${model}`, event.detail[model])
        }
        return h(tag, mergeProps(attrs, controlled ? { [model]: current } : {}, { [modelEvents[model]]: listener }), slots.default?.())
      }
    },
  })
}

export const LuDialog = modelled('lu-dialog', 'open')
export const LuSheet = modelled('lu-sheet', 'open')
export const LuConfirmDialog = modelled('lu-confirm-dialog', 'open')
export const LuTooltip = modelled('lu-tooltip', 'open')
export const LuHoverCard = modelled('lu-hover-card', 'open')
export const LuSelect = modelled('lu-select', 'value')
export const LuSegmented = modelled('lu-segmented', 'value')
export const LuTabs = modelled('lu-tabs', 'value')
export const LuMultiSelect = modelled('lu-multi-select', 'selected')
