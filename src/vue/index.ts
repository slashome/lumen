import type { DefineComponent } from 'vue'
import type {
  LumenConfirmDialog,
  LumenDialog,
  LumenDragArea,
  LumenDraggable,
  LumenDropZone,
  LumenHighlight,
  LumenHoverCard,
  LumenIcon,
  LumenMarkdown,
  LumenMultiSelect,
  LumenOption,
  LumenSegmented,
  LumenSelect,
  LumenSheet,
  LumenToaster,
  LumenTooltip,
} from '../index'

export function isLumenElement(tag: string): boolean {
  return tag.startsWith('lumen-')
}

type Element<Props> = DefineComponent<Partial<Omit<Props, keyof HTMLElement>>>

declare module 'vue' {
  interface GlobalComponents {
    'lumen-icon': Element<LumenIcon>
    'lumen-dialog': Element<LumenDialog>
    'lumen-sheet': Element<LumenSheet>
    'lumen-confirm-dialog': Element<LumenConfirmDialog>
    'lumen-tooltip': Element<LumenTooltip>
    'lumen-hover-card': Element<LumenHoverCard>
    'lumen-option': Element<LumenOption>
    'lumen-select': Element<LumenSelect>
    'lumen-multi-select': Element<LumenMultiSelect>
    'lumen-segmented': Element<LumenSegmented>
    'lumen-toaster': Element<LumenToaster>
    'lumen-markdown': Element<LumenMarkdown>
    'lumen-highlight': Element<LumenHighlight>
    'lumen-draggable': Element<LumenDraggable>
    'lumen-drop-zone': Element<LumenDropZone>
    'lumen-drag-area': Element<LumenDragArea>
  }
}
