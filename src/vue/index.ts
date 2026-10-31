import type { Plugin } from 'vue'
import { registerLumenMessages, type LumenMessages } from '../lib/messages'

export type { LumenElementTag } from './elements'
export type { LumenMessages } from '../lib/messages'
export { LuCombobox, LuConfirmDialog, LuDialog, LuHoverCard, LuMultiSelect, LuSegmented, LuSelect, LuSheet, LuTabs, LuTooltip } from './models'

export interface LumenPluginOptions {
  messages: Record<string, LumenMessages>
}

export const lumen: Plugin<[LumenPluginOptions]> = {
  install(_app, { messages }) {
    Object.entries(messages).forEach(([lang, entries]) => registerLumenMessages(lang, entries))
  },
}

export function isLumenElement(tag: string): boolean {
  return tag.startsWith('lu-')
}
