import { createComponent, type EventName } from '@lit/react'
import * as React from 'react'
import type { OpenChangeDetail } from '../elements/dialog'
import type { DragEndDetail } from '../elements/drag-area'
import type { NavigateDetail } from '../elements/markdown'
import type { SelectedChangeDetail } from '../elements/multi-select'
import type { ValueChangeDetail } from '../elements/select'
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

const openChange = { onOpenChange: 'lumen-open-change' as EventName<CustomEvent<OpenChangeDetail>> }

export const IconElement = createComponent({ tagName: 'lumen-icon', elementClass: LumenIcon, react: React })
export const DialogElement = createComponent({ tagName: 'lumen-dialog', elementClass: LumenDialog, react: React, events: openChange })
export const SheetElement = createComponent({ tagName: 'lumen-sheet', elementClass: LumenSheet, react: React, events: openChange })
export const ConfirmDialogElement = createComponent({
  tagName: 'lumen-confirm-dialog',
  elementClass: LumenConfirmDialog,
  react: React,
  events: { ...openChange, onConfirm: 'lumen-confirm' as EventName<CustomEvent<object>> },
})
export const TooltipElement = createComponent({ tagName: 'lumen-tooltip', elementClass: LumenTooltip, react: React })
export const HoverCardElement = createComponent({ tagName: 'lumen-hover-card', elementClass: LumenHoverCard, react: React })
export const OptionElement = createComponent({ tagName: 'lumen-option', elementClass: LumenOption, react: React })
export const SelectElement = createComponent({
  tagName: 'lumen-select',
  elementClass: LumenSelect,
  react: React,
  events: { onValueChange: 'lumen-value-change' as EventName<CustomEvent<ValueChangeDetail>> },
})
export const MultiSelectElement = createComponent({
  tagName: 'lumen-multi-select',
  elementClass: LumenMultiSelect,
  react: React,
  events: { onSelectedChange: 'lumen-selected-change' as EventName<CustomEvent<SelectedChangeDetail>> },
})
export const SegmentedElement = createComponent({
  tagName: 'lumen-segmented',
  elementClass: LumenSegmented,
  react: React,
  events: { onValueChange: 'lumen-value-change' as EventName<CustomEvent<ValueChangeDetail<string | null>>> },
})
export const ToasterElement = createComponent({ tagName: 'lumen-toaster', elementClass: LumenToaster, react: React })
export const MarkdownElement = createComponent({
  tagName: 'lumen-markdown',
  elementClass: LumenMarkdown,
  react: React,
  events: { onNavigate: 'lumen-navigate' as EventName<CustomEvent<NavigateDetail>> },
})
export const HighlightElement = createComponent({ tagName: 'lumen-highlight', elementClass: LumenHighlight, react: React })
export const DragAreaElement = createComponent({
  tagName: 'lumen-drag-area',
  elementClass: LumenDragArea,
  react: React,
  events: { onDragEnd: 'lumen-drag-end' as EventName<CustomEvent<DragEndDetail>> },
})
export const DraggableElement = createComponent({
  tagName: 'lumen-draggable',
  elementClass: LumenDraggable,
  react: React,
  events: { onOpen: 'lumen-open' as EventName<CustomEvent<object>> },
})
export const DropZoneElement = createComponent({ tagName: 'lumen-drop-zone', elementClass: LumenDropZone, react: React })
