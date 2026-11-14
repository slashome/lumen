---
'@slashome/lumen': minor
---

Every component of `@slashome/lumen/react` takes the `Lu` prefix, the name the Vue adapter already uses: `Button` becomes `LuButton`, and so do `Icon`, `Badge`, `Tag`, `Input`, `NativeSelect`, `Switch`, `Kbd`, `EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`, `ComingSoon`, `Dialog`, `Sheet`, `ConfirmDialog`, `Tooltip`, `HoverCard`, `Select`, `SelectItem`, `MultiSelect`, `Combobox`, `Segmented`, `Tabs`, `Toaster`, `Markdown`, `HighlightTerms`, `Highlight`, `DragArea`, `Draggable`, `DropZone` and `DataTable`. The props types follow: `ButtonProps` becomes `LuButtonProps`, `SegmentedProps` becomes `LuSegmentedProps`. The old names are removed, with no alias: rename the imports and the JSX. `toast`, `classes`, `buttonClasses`, `useStoredSort`, `useHighlightTerms`, `ButtonVariant`, `ButtonSize`, `OpenChangeHandler`, `Column` and `DragEndEvent` keep their names.
