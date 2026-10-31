export type { LumenElementTag } from './elements'

export function isLumenElement(tag: string): boolean {
  return tag.startsWith('lu-')
}
