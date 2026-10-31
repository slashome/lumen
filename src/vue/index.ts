export type { LumenElementTag } from './elements'
export { LuConfirmDialog, LuDialog, LuHoverCard, LuMultiSelect, LuSegmented, LuSelect, LuSheet, LuTabs, LuTooltip } from './models'

export function isLumenElement(tag: string): boolean {
  return tag.startsWith('lu-')
}
