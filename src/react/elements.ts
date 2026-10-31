import { createComponent, type EventName } from '@lit/react'
import * as React from 'react'
import type { OpenChangeDetail } from '../components/dialog/dialog'
import type { DragEndDetail } from '../components/drag-area/drag-area'
import type { NavigateDetail } from '../components/markdown/markdown'
import type { SelectedChangeDetail } from '../components/multi-select/multi-select'
import type { ValueChangeDetail } from '../components/select/select'
import {
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

const openChange = { onOpenChange: 'lu-open-change' as EventName<CustomEvent<OpenChangeDetail>> }

export const IconElement = createComponent({ tagName: 'lu-icon', elementClass: LumenIcon, react: React })
export const DialogElement = createComponent({ tagName: 'lu-dialog', elementClass: LumenDialog, react: React, events: openChange })
export const SheetElement = createComponent({ tagName: 'lu-sheet', elementClass: LumenSheet, react: React, events: openChange })
export const ConfirmDialogElement = createComponent({
  tagName: 'lu-confirm-dialog',
  elementClass: LumenConfirmDialog,
  react: React,
  events: { ...openChange, onConfirm: 'lu-confirm' as EventName<CustomEvent<object>> },
})
export const TooltipElement = createComponent({ tagName: 'lu-tooltip', elementClass: LumenTooltip, react: React })
export const HoverCardElement = createComponent({ tagName: 'lu-hover-card', elementClass: LumenHoverCard, react: React })
export const OptionElement = createComponent({ tagName: 'lu-option', elementClass: LumenOption, react: React })
export const SelectElement = createComponent({
  tagName: 'lu-select',
  elementClass: LumenSelect,
  react: React,
  events: { onValueChange: 'lu-value-change' as EventName<CustomEvent<ValueChangeDetail>> },
})
export const MultiSelectElement = createComponent({
  tagName: 'lu-multi-select',
  elementClass: LumenMultiSelect,
  react: React,
  events: { onSelectedChange: 'lu-selected-change' as EventName<CustomEvent<SelectedChangeDetail>> },
})
export const SegmentedElement = createComponent({
  tagName: 'lu-segmented',
  elementClass: LumenSegmented,
  react: React,
  events: { onValueChange: 'lu-value-change' as EventName<CustomEvent<ValueChangeDetail<string | null>>> },
})
export const ToasterElement = createComponent({ tagName: 'lu-toaster', elementClass: LumenToaster, react: React })
export const MarkdownElement = createComponent({
  tagName: 'lu-markdown',
  elementClass: LumenMarkdown,
  react: React,
  events: { onNavigate: 'lu-navigate' as EventName<CustomEvent<NavigateDetail>> },
})
export const HighlightElement = createComponent({ tagName: 'lu-highlight', elementClass: LumenHighlight, react: React })
export const DragAreaElement = createComponent({
  tagName: 'lu-drag-area',
  elementClass: LumenDragArea,
  react: React,
  events: { onDragEnd: 'lu-drag-end' as EventName<CustomEvent<DragEndDetail>> },
})
export const DraggableElement = createComponent({
  tagName: 'lu-draggable',
  elementClass: LumenDraggable,
  react: React,
  events: { onOpen: 'lu-open' as EventName<CustomEvent<object>> },
})
export const DropZoneElement = createComponent({ tagName: 'lu-drop-zone', elementClass: LumenDropZone, react: React })
