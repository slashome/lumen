import { useEffect, useMemo, useSyncExternalStore, type ComponentProps, type InputHTMLAttributes, type ReactNode } from 'react'
import type { LinkResolver } from '../components/markdown/markdown'
import type { OpenChangeSource, ValueChangeSource } from '../lib/change'
import type { MultiSelectOption } from '../components/multi-select/multi-select'
import type { Range } from '../lib/highlight'
import { highlightTerms } from '../lib/highlight-terms'
import { nextSort, sortRows, type SortDirection, type SortValue, type TableSort } from '../lib/sort'
import { storedSort } from '../lib/sort-store'
import { documentLang, messagesFor, reportMissing, subscribeToMessages } from '../lib/messages'
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
export type { OpenChangeSource, ValueChangeSource } from '../lib/change'

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

function subscribeToLang(onChange: () => void) {
  return subscribeToMessages({ requestUpdate: onChange })
}

function registeredLoadingLabel(): string | undefined {
  return messagesFor(documentLang())?.loading
}

function useLoadingLabel(label: string | undefined): string | undefined {
  const registered = useSyncExternalStore(subscribeToLang, registeredLoadingLabel, () => undefined)
  const resolved = label || registered
  useEffect(() => {
    if (!resolved) {
      reportMissing(LoadingState, 'LoadingState', 'loading', documentLang(), 'the label prop')
    }
  }, [resolved])
  return resolved
}

export function LoadingState({ rows = 4, label }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={useLoadingLabel(label)} className="lu-loading-state">
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

function controlledBy<Detail>(controlled: boolean, handle: (detail: Detail) => void) {
  return (event: CustomEvent<Detail>) => {
    if (controlled) {
      event.preventDefault()
    }
    handle(event.detail)
  }
}

function only<Key extends string, Value>(key: Key, value: Value | undefined): Partial<Record<Key, Value>> {
  return value === undefined ? {} : ({ [key]: value } as Record<Key, Value>)
}

export type OpenChangeHandler = (open: boolean, source: OpenChangeSource) => void

interface ModalProps {
  open?: boolean
  onOpenChange?: OpenChangeHandler
  title: ReactNode
  description?: ReactNode
  className?: string
  children?: ReactNode
}

interface DialogProps extends ModalProps {
  closeLabel?: string
}

function Titles({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <>
      <span slot="heading">{title}</span>
      {description ? <span slot="description">{description}</span> : null}
    </>
  )
}

function openChange(open: boolean | undefined, onOpenChange: OpenChangeHandler | undefined) {
  return controlledBy<{ open: boolean; source: OpenChangeSource }>(open !== undefined, (detail) => onOpenChange?.(detail.open, detail.source))
}

export function Dialog({ open, onOpenChange, title, description, closeLabel, className, children }: DialogProps) {
  return (
    <DialogElement {...only('open', open)} {...only('closeLabel', closeLabel)} onOpenChange={openChange(open, onOpenChange)} className={className}>
      <Titles title={title} description={description} />
      {children}
    </DialogElement>
  )
}

export function Sheet({ open, onOpenChange, title, description, closeLabel, className, children }: DialogProps) {
  return (
    <SheetElement {...only('open', open)} {...only('closeLabel', closeLabel)} onOpenChange={openChange(open, onOpenChange)} className={className}>
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
  cancelLabel,
  pending = false,
  onConfirm,
}: Omit<ModalProps, 'children' | 'className'> & { confirmLabel?: string; cancelLabel?: string; pending?: boolean; onConfirm: () => void }) {
  return (
    <ConfirmDialogElement
      {...only('open', open)}
      onOpenChange={openChange(open, onOpenChange)}
      onConfirm={onConfirm}
      {...only('confirmLabel', confirmLabel)}
      {...only('cancelLabel', cancelLabel)}
      pending={pending}
    >
      <Titles title={title} description={description} />
    </ConfirmDialogElement>
  )
}

export function Tooltip({
  htmlFor,
  open,
  onOpenChange,
  children,
}: {
  htmlFor: string
  open?: boolean
  onOpenChange?: OpenChangeHandler
  children: ReactNode
}) {
  return (
    <TooltipElement htmlFor={htmlFor} {...only('open', open)} onOpenChange={openChange(open, onOpenChange)}>
      {children}
    </TooltipElement>
  )
}

export function HoverCard({
  htmlFor,
  children,
  openDelay = 700,
  pinned = false,
  open,
  onOpenChange,
  className,
}: {
  htmlFor: string
  children: ReactNode
  openDelay?: number
  pinned?: boolean
  open?: boolean
  onOpenChange?: OpenChangeHandler
  className?: string
}) {
  return (
    <HoverCardElement htmlFor={htmlFor} openDelay={openDelay} pinned={pinned} {...only('open', open)} onOpenChange={openChange(open, onOpenChange)} className={className}>
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
  value?: string
  onValueChange?: (value: string, source: ValueChangeSource) => void
  display?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <SelectElement
      label={label}
      {...only('value', value)}
      onValueChange={controlledBy<{ value: string; source: ValueChangeSource }>(value !== undefined, (detail) => onValueChange?.(detail.value, detail.source))}
      className={className}
    >
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
  clearLabel,
  onChange,
}: {
  label: string
  options: MultiSelectOption[]
  selected?: string[]
  clearLabel?: string
  onChange?: (selected: string[], source: ValueChangeSource) => void
}) {
  return (
    <MultiSelectElement
      label={label}
      options={options}
      {...only('selected', selected)}
      {...only('clearLabel', clearLabel)}
      onSelectedChange={controlledBy<{ selected: string[]; source: ValueChangeSource }>(selected !== undefined, (detail) => onChange?.(detail.selected, detail.source))}
    />
  )
}

export interface SegmentedProps {
  label: string
  values: string[]
  value?: string | null
  onChange?: (value: string | null, source: ValueChangeSource) => void
  skipTab?: boolean
  /** @deprecated Use `skipTab`, true to leave the buttons out of the tab order. Removed in the next major version. */
  focusable?: boolean
}

export function Segmented({ label, values, value, onChange, skipTab = false, focusable = true }: SegmentedProps) {
  return (
    <SegmentedElement
      label={label}
      values={values}
      {...only('value', value)}
      skipTab={skipTab || !focusable}
      onValueChange={controlledBy<{ value: string | null; source: ValueChangeSource }>(value !== undefined, (detail) => onChange?.(detail.value, detail.source))}
    />
  )
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
  value?: string
  onChange?: (value: string, source: ValueChangeSource) => void
  manual?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <TabsElement
      label={label}
      {...only('value', value)}
      manual={manual}
      onValueChange={controlledBy<{ value: string; source: ValueChangeSource }>(value !== undefined, (detail) => onChange?.(detail.value, detail.source))}
      className={className}
    >
      {children}
    </TabsElement>
  )
}

export function Toaster({ label, closeLabel }: { label?: string; closeLabel?: string } = {}) {
  return <ToasterElement {...only('label', label)} {...only('closeLabel', closeLabel)} />
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

export function Draggable({
  id,
  onOpen,
  label,
  roleDescription,
  className,
  children,
}: {
  id: string
  onOpen?: () => void
  label?: string
  roleDescription?: string
  className?: string
  children: ReactNode
}) {
  return (
    <DraggableElement dragId={id} openable={Boolean(onOpen)} label={label ?? ''} {...only('roleDescription', roleDescription)} onOpen={() => onOpen?.()} className={className}>
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
