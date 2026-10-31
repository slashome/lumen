import { useEffect, useMemo, useSyncExternalStore, type ComponentProps, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react'
import type { LinkResolver } from '../components/markdown/markdown'
import type { MultiSelectOption } from '../components/multi-select/multi-select'
import type { Range } from '../lib/highlight'
import { highlightTerms } from '../lib/highlight-terms'
import { nextSort, sortRows, type SortDirection, type SortValue, type TableSort } from '../lib/sort'
import { storedSort } from '../lib/sort-store'
import {
  ConfirmDialogElement,
  DialogElement,
  DragAreaElement,
  DraggableElement,
  DropZoneElement,
  HighlightElement,
  HoverCardElement,
  IconElement,
  MarkdownElement,
  MultiSelectElement,
  OptionElement,
  SegmentedElement,
  SelectElement,
  SheetElement,
  TabsElement,
  ToasterElement,
  TooltipElement,
} from './elements'

export { toast } from '../lib/toast'
export type { LinkResolver, LinkTarget } from '../components/markdown/markdown'
export type { MultiSelectOption } from '../components/multi-select/multi-select'

export function classes(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/** `'destructive'` is deprecated: use `'danger'`, which draws the same. Removed in the next major version. */
export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'danger' | 'destructive'
export type ButtonSize = 'default' | 'sm' | 'icon'

function variantModifier(variant: ButtonVariant): string {
  return variant === 'destructive' ? 'danger' : variant
}

export function buttonClasses({ variant = 'default', size = 'default' }: { variant?: ButtonVariant | null; size?: ButtonSize | null } = {}): string {
  return classes('lu-button', variant && variant !== 'default' && `lu-button--${variantModifier(variant)}`, size && size !== 'default' && `lu-button--${size}`)
}

export type ButtonProps = ComponentProps<'button'> & { variant?: ButtonVariant | null; size?: ButtonSize | null }

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={classes(buttonClasses({ variant, size }), className)} {...props} />
}

export function Icon({ name, label, className }: { name: string; label?: string; className?: string }) {
  return <IconElement name={name} label={label ?? ''} className={className} />
}

export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return <span className={classes('lu-badge', className)} {...props} />
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={classes('lu-input', className)} {...props} />
}

export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return (
    <span className="lu-native-select">
      <select className={classes('lu-native-select__control', className)} {...props} />
    </span>
  )
}

export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={classes('lu-switch', className)}
      checked={checked}
      aria-checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      {...props}
    />
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="lu-kbd">{children}</kbd>
}

export function EmptyState({ icon, title, children, className }: { icon?: string; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={classes('lu-empty-state', className)}>
      {icon && <IconElement name={icon} className="lu-empty-state__icon" />}
      <p className="lu-empty-state__title">{title}</p>
      {children}
    </div>
  )
}

export function LoadingState({ rows = 4, label = 'Loading…' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="lu-loading-state">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="lu-loading-state__row" />
      ))}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p role="alert" className="lu-error-state">
      {message}
    </p>
  )
}

export function PageHeader({ title, description, actions, children }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <div className="lu-page-header">
      <div className="lu-page-header__main">
        <h1 className="lu-page-header__title">{title}</h1>
        {description && <p className="lu-page-header__description">{description}</p>}
        {children}
      </div>
      {actions && <div className="lu-page-header__actions">{actions}</div>}
    </div>
  )
}

export function ComingSoon({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="lu-coming-soon">
      <h1 className="lu-coming-soon__title">{title}</h1>
      {children && <p className="lu-coming-soon__text">{children}</p>}
    </div>
  )
}

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  className?: string
  children?: ReactNode
}

function Titles({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <>
      <span slot="heading">{title}</span>
      {description ? <span slot="description">{description}</span> : null}
    </>
  )
}

export function Dialog({ open, onOpenChange, title, description, className, children }: DialogProps) {
  return (
    <DialogElement open={open} onOpenChange={(event) => onOpenChange(event.detail.open)} className={className}>
      <Titles title={title} description={description} />
      {children}
    </DialogElement>
  )
}

export function Sheet({ open, onOpenChange, title, description, className, children }: DialogProps) {
  return (
    <SheetElement open={open} onOpenChange={(event) => onOpenChange(event.detail.open)} className={className}>
      <Titles title={title} description={description} />
      {children}
    </SheetElement>
  )
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  pending = false,
  onConfirm,
}: Omit<DialogProps, 'children' | 'className'> & { confirmLabel: string; cancelLabel?: string; pending?: boolean; onConfirm: () => void }) {
  return (
    <ConfirmDialogElement
      open={open}
      onOpenChange={(event) => onOpenChange(event.detail.open)}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      pending={pending}
    >
      <Titles title={title} description={description} />
    </ConfirmDialogElement>
  )
}

export function Tooltip({ content, children }: { content: string; children: ReactElement }) {
  return <TooltipElement content={content}>{children}</TooltipElement>
}

export function HoverCard({
  trigger,
  children,
  openDelay = 700,
  pinned = false,
  className,
}: {
  trigger: ReactElement
  children: ReactNode
  openDelay?: number
  pinned?: boolean
  className?: string
}) {
  return (
    <HoverCardElement openDelay={openDelay} pinned={pinned} className={className}>
      <span slot="trigger">{trigger}</span>
      {children}
    </HoverCardElement>
  )
}

export function Select({
  label,
  value,
  onValueChange,
  display,
  children,
  className,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  display?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <SelectElement label={label} value={value} onValueChange={(event) => onValueChange(event.detail.value)} className={className}>
      {display ? <span slot="display">{display}</span> : null}
      {children}
    </SelectElement>
  )
}

export function SelectItem({ value, textValue, children, className }: { value: string; textValue?: string; children: ReactNode; className?: string }) {
  return (
    <OptionElement value={value} textValue={textValue ?? ''} className={className}>
      {children}
    </OptionElement>
  )
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  return <MultiSelectElement label={label} options={options} selected={selected} onSelectedChange={(event) => onChange(event.detail.selected)} />
}

export function Segmented({
  label,
  values,
  value,
  onChange,
  focusable = true,
}: {
  label: string
  values: string[]
  value: string | null
  onChange: (value: string | null) => void
  focusable?: boolean
}) {
  return <SegmentedElement label={label} values={values} value={value} focusable={focusable} onValueChange={(event) => onChange(event.detail.value)} />
}

export function Tabs({
  label,
  value,
  onChange,
  manual = false,
  children,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  manual?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <TabsElement label={label} value={value} manual={manual} onValueChange={(event) => onChange(event.detail.value)} className={className}>
      {children}
    </TabsElement>
  )
}

export function Toaster() {
  return <ToasterElement />
}

export function Markdown({
  source,
  resolveLink,
  onNavigate,
  className,
}: {
  source: string
  resolveLink?: LinkResolver
  onNavigate?: (href: string) => void
  className?: string
}) {
  return <MarkdownElement source={source} resolveLink={resolveLink} onNavigate={(event) => onNavigate?.(event.detail.href)} className={className} />
}

export function HighlightTerms({ terms, children }: { terms: readonly string[]; children: ReactNode }) {
  useEffect(() => highlightTerms.set(terms), [terms])
  return children
}

export function useHighlightTerms(): readonly string[] {
  return useSyncExternalStore(highlightTerms.subscribe, highlightTerms.get)
}

export function Highlight({ text, terms, ranges }: { text: string; terms?: readonly string[]; ranges?: readonly Range[] }) {
  return <HighlightElement text={text} terms={terms} ranges={ranges} />
}

export interface DragEndEvent {
  active: { id: string }
  over: { id: string } | null
}

export function DragArea({ onDragEnd, children, className }: { onDragEnd: (event: DragEndEvent) => void; children: ReactNode; className?: string }) {
  return (
    <DragAreaElement
      className={className}
      onDragEnd={(event) => onDragEnd({ active: { id: event.detail.active }, over: event.detail.over === null ? null : { id: event.detail.over } })}
    >
      {children}
    </DragAreaElement>
  )
}

export function Draggable({ id, onOpen, label, className, children }: { id: string; onOpen?: () => void; label?: string; className?: string; children: ReactNode }) {
  return (
    <DraggableElement dragId={id} openable={Boolean(onOpen)} label={label ?? ''} onOpen={() => onOpen?.()} className={className}>
      {children}
    </DraggableElement>
  )
}

export function DropZone({ id, label, className, children }: { id: string; label?: string; className?: string; children: ReactNode }) {
  return (
    <DropZoneElement zoneId={id} label={label ?? ''} className={className}>
      {children}
    </DropZoneElement>
  )
}

export function useStoredSort(key: string): [TableSort | null, (sort: TableSort | null) => void] {
  const store = useMemo(() => storedSort(key), [key])
  const raw = useSyncExternalStore(store.subscribe, () => JSON.stringify(store.get()))
  const sort = useMemo(() => JSON.parse(raw) as TableSort | null, [raw])
  return [sort, store.set]
}

export interface Column<Row> {
  id: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  sortValue?: (row: Row) => SortValue
  className?: string
  headerClassName?: string
}

function ariaSort(direction: SortDirection | undefined) {
  return direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'
}

function sortIcon(direction: SortDirection | undefined) {
  return direction === 'asc' ? 'sort-asc' : direction === 'desc' ? 'sort-desc' : 'sort'
}

export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  storageKey,
  label,
  rowProps,
  empty,
  className,
}: {
  rows: Row[]
  columns: Column<Row>[]
  rowKey: (row: Row) => string
  storageKey: string
  label?: string
  rowProps?: (row: Row, index: number) => ComponentProps<'tr'>
  empty?: ReactNode
  className?: string
}) {
  const [sort, setSort] = useStoredSort(storageKey)
  const sortedBy = columns.find((column) => column.id === sort?.column && column.sortValue !== undefined)
  const sorted = useMemo(() => (sort && sortedBy?.sortValue ? sortRows(rows, sortedBy.sortValue, sort.direction) : rows), [rows, sort, sortedBy])

  return (
    <div className={classes('lu-data-table', className)}>
      <table aria-label={label} className="lu-data-table__table">
        <thead className="lu-data-table__head">
          <tr>
            {columns.map((column) => {
              const direction = sortedBy?.id === column.id ? sort?.direction : undefined
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={column.sortValue ? ariaSort(direction) : undefined}
                  className={classes('lu-data-table__header', column.headerClassName)}
                >
                  {column.sortValue ? (
                    <button type="button" className="lu-data-table__sort" data-direction={direction} onClick={() => setSort(nextSort(sort, column.id))}>
                      {column.header}
                      <IconElement name={sortIcon(direction)} className="lu-data-table__sort-icon" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, index) => {
            const props = rowProps?.(row, index) ?? {}
            return (
              <tr key={rowKey(row)} {...props} className={classes('lu-data-table__row', props.className)}>
                {columns.map((column) => (
                  <td key={column.id} className={classes('lu-data-table__cell', column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length === 0 && empty && <p className="lu-data-table__empty">{empty}</p>}
    </div>
  )
}
