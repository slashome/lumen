import type { Plugin } from 'vue'
import { registerLumenMessages, type LumenMessages } from '../lib/messages'
import { setLumenTheme, type LumenTheme } from '../lib/theme'

export type { LumenElementTag } from './elements'
export type { LumenMessages } from '../lib/messages'
export type { LumenTheme } from '../lib/theme'
export { LuButton } from './button'
export type { ButtonSize, ButtonVariant } from '../lib/button'
export { LuCombobox, LuConfirmDialog, LuDialog, LuHoverCard, LuMultiSelect, LuSegmented, LuSelect, LuSheet, LuTabs, LuTooltip } from './models'

export interface LumenPluginOptions {
  messages: Record<string, LumenMessages>
  theme?: LumenTheme
}

export const lumen: Plugin<[LumenPluginOptions]> = {
  install(_app, { messages, theme }) {
    Object.entries(messages).forEach(([lang, entries]) => registerLumenMessages(lang, entries))
    if (theme) {
      setLumenTheme(theme)
    }
  },
}

export function isLumenElement(tag: string): boolean {
  return tag.startsWith('lu-')
}
