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
  return tag.startsWith('lu-')
}

type Element<Props> = DefineComponent<Partial<Omit<Props, keyof HTMLElement>>>

declare module 'vue' {
  interface GlobalComponents {
    'lu-icon': Element<LumenIcon>
    'lu-dialog': Element<LumenDialog>
    'lu-sheet': Element<LumenSheet>
    'lu-confirm-dialog': Element<LumenConfirmDialog>
    'lu-tooltip': Element<LumenTooltip>
    'lu-hover-card': Element<LumenHoverCard>
    'lu-option': Element<LumenOption>
    'lu-select': Element<LumenSelect>
    'lu-multi-select': Element<LumenMultiSelect>
    'lu-segmented': Element<LumenSegmented>
    'lu-toaster': Element<LumenToaster>
    'lu-markdown': Element<LumenMarkdown>
    'lu-highlight': Element<LumenHighlight>
    'lu-draggable': Element<LumenDraggable>
    'lu-drop-zone': Element<LumenDropZone>
    'lu-drag-area': Element<LumenDragArea>
  }
}
