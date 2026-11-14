import { defineComponent, h, type PropType } from 'vue'
import { blockedWhile, busyAttributes, buttonClasses, type ButtonSize, type ButtonVariant } from '../lib/button'

export const LuButton = defineComponent({
  name: 'LuButton',
  props: {
    variant: { type: String as PropType<ButtonVariant | null>, default: undefined },
    size: { type: String as PropType<ButtonSize | null>, default: undefined },
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    href: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
  },
  emits: {
    click: (event: MouseEvent) => event instanceof Event,
  },
  setup(props, { slots, emit }) {
    return () => {
      const target = props.href === undefined ? { type: props.type } : { href: props.href }
      const onClick = blockedWhile(props.loading, (event: MouseEvent) => emit('click', event))
      return h(props.href === undefined ? 'button' : 'a', { class: buttonClasses(props), ...target, ...busyAttributes(props.loading), onClick }, slots.default?.())
    }
  },
})
