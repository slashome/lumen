import { css, html, LitElement, nothing, type PropertyValues } from 'lit'
import { live } from 'lit/directives/live.js'
import { repeat } from 'lit/directives/repeat.js'
import type { ValueChangeDetail, ValueChangeSource } from '../../lib/change'
import { define } from '../../lib/define'
import { emit } from '../../lib/emit'
import { float } from '../../lib/floating'
import { foldText } from '../../lib/fold'
import { nextIndex } from '../../lib/list-navigation'
import { MessagesController, requiredLabel } from '../../lib/messages'
import { isPopoverOpen } from '../../lib/popover'
import { popoverStyles, utilityStyles } from '../../lib/styles'
import type { RemoveDetail } from '../tag/tag'
import '../icon/icon'
import '../tag/tag'

export type { ValueChangeDetail, ValueChangeSource } from '../../lib/change'

export interface ComboboxOption {
  value: string
  label: string
}

export type ComboboxValue = string | string[]

export interface SearchDetail {
  query: string
}

interface Item {
  value: string
  label: string
  id: string
  create: boolean
}

function parseValue(attribute: string | null): ComboboxValue {
  const text = attribute ?? ''
  if (!text.trim().startsWith('[')) {
    return text
  }
  try {
    const parsed: unknown = JSON.parse(text)
    return Array.isArray(parsed) ? parsed.map(String) : text
  } catch {
    return text
  }
}

function sameText(left: string, right: string): boolean {
  return foldText(left.trim()) === foldText(right.trim())
}

/**
 * A text field that filters a list of options as the user types, on the ARIA combobox pattern with a listbox popup: the focus stays in the field, the arrow keys move the active option (`aria-activedescendant`), Enter picks it, Escape closes the list, Home and End reach the first and last option while one is active, Tab closes the list and moves on.
 *
 * It takes its options as data. By default it filters them itself, ignoring case and accents; with `skip-filter`, it shows them as given, for an application that loads them: it listens to `lu-search`, which carries the text typed on every change with no delay (debounce or cancel the request there), sets `loading` while it waits and then `options`.
 *
 * With `multiple`, the values are drawn as removable `lu-tag` before the text, picking an option adds or removes it and keeps the list open, and Backspace in the empty field removes the last value. With `creatable`, a text no option matches is offered as a value of its own.
 *
 * The element fires `lu-value-change`, then sets its own `value` unless a listener cancels the event. It is form-associated: with a `name`, its value is submitted with the form, one entry per value; a form reset empties it and a disabled fieldset disables it.
 *
 * The texts come from `registerLumenMessages()`: `comboboxCreate` for the option that creates a value, `comboboxNoResults` when nothing matches, `comboboxResults` to announce the count, `loading` while `loading` is set, and `tagRemove` for the remove button of each value.
 *
 * @summary A text field that filters options, picks one or several, or creates one.
 * @tag lu-combobox
 * @csspart control - The box that looks like a field and holds the tags and the input.
 * @csspart input - The text input, which has the combobox role.
 * @csspart popup - The floating panel of the list and its messages.
 * @csspart listbox - The list of options.
 * @fires {CustomEvent<ValueChangeDetail<ComboboxValue>>} lu-value-change - The user picked, created or removed a value. `detail.value` is the value the element will hold, a string, or an array with `multiple`; `detail.source` is `option` for an option picked (or unpicked with `multiple`), `create` for a value created from the text, `remove` for a tag removed or Backspace in the empty field, `clear` when the text of a single combobox was emptied and left. Cancelable: `preventDefault()` keeps the current `value`, which the element still holds while the event runs.
 * @fires {CustomEvent<SearchDetail>} lu-search - The text typed changed, by the user or because the element emptied it after a choice. `detail.query` is the text. Fired on every change, without delay. Not cancelable: the element only reports it; with `skip-filter`, the application answers by setting `options`.
 */
export class LumenCombobox extends LitElement {
  /** @internal Read by the browser to make the element form-associated; the tag keeps it out of custom-elements.json. */
  static formAssociated = true

  static properties = {
    label: {},
    options: { type: Array },
    value: { converter: { fromAttribute: parseValue } },
    multiple: { type: Boolean, reflect: true },
    creatable: { type: Boolean, reflect: true },
    skipFilter: { type: Boolean, attribute: 'skip-filter', reflect: true },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    placeholder: {},
    query: { state: true },
    editing: { state: true },
    expanded: { state: true },
    active: { state: true },
    announcement: { state: true },
    formDisabled: { state: true },
  }

  static styles = [
    popoverStyles,
    utilityStyles,
    css`
      :host {
        display: block;
        font-size: var(--lu-font-size-sm);
      }

      .control {
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--lu-space-1);
        min-block-size: var(--lu-control-height);
        padding: var(--lu-space-1) var(--lu-space-2-5);
        border: 1px solid var(--lu-color-border);
        border-radius: var(--lu-radius-md);
        background: var(--lu-color-background);
        cursor: text;
      }

      .control:focus-within {
        outline: 2px solid var(--lu-color-ring);
        outline-offset: 0;
      }

      .control.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      input {
        flex: 1;
        min-inline-size: 6rem;
        padding: 0;
        border: 0;
        outline: none;
        background: none;
        color: inherit;
        font: inherit;
      }

      input::placeholder {
        color: var(--lu-color-muted-foreground);
      }

      input:disabled {
        cursor: not-allowed;
      }

      .chevron {
        margin-inline-start: auto;
        color: var(--lu-color-muted-foreground);
      }

      [popover] {
        box-sizing: border-box;
        min-inline-size: var(--lu-anchor-width);
        max-block-size: min(20rem, var(--lu-available-height, 20rem));
        padding: var(--lu-space-1);
        overflow-y: auto;
      }

      [role='option'] {
        position: relative;
        display: flex;
        align-items: center;
        padding-block: var(--lu-space-1);
        padding-inline: 1.75rem var(--lu-space-2);
        border-radius: var(--lu-radius-sm);
        cursor: pointer;
        user-select: none;
      }

      [role='option']:hover,
      [role='option'].active {
        background: var(--lu-color-muted);
      }

      [role='option'][aria-selected='true'] {
        font-weight: var(--lu-font-weight-medium);
      }

      .mark {
        position: absolute;
        inset-inline-start: var(--lu-space-2);
        display: inline-flex;
        --lu-icon-size: 0.875rem;
      }

      .message {
        display: flex;
        align-items: center;
        gap: var(--lu-space-2);
        margin: 0;
        padding: var(--lu-space-1) var(--lu-space-2);
        color: var(--lu-color-muted-foreground);
      }
    `,
  ]

  /**
   * The accessible name of the field and of its list. Without it, the element logs an error.
   * @required
   */
  declare label: string
  /** The options, in order: `{ value, label }`. With `skip-filter`, the ones to show for the text typed, which the application sets after `lu-search`. */
  declare options: ComboboxOption[]
  /** The value held: a string, empty for none; with `multiple`, an array of strings, which the attribute takes as JSON. A value no option has is shown as itself. */
  declare value: ComboboxValue
  /** Whether the element holds several values, drawn as tags. */
  declare multiple: boolean
  /** Whether a text that matches no option is offered as a new value. */
  declare creatable: boolean
  /** Whether the element shows `options` as given instead of filtering them by the text typed, for options the application loads on `lu-search`. */
  declare skipFilter: boolean
  /** Whether the application is loading options: the list shows the `loading` message in their place. */
  declare loading: boolean
  /** Whether the field ignores the user. A disabled `<fieldset>` around it disables it too. */
  declare disabled: boolean
  /** The name its value is submitted under with its form. Without it, the form gets nothing. */
  declare name: string
  /** The text shown in the empty field. */
  declare placeholder: string
  declare private query: string
  declare private editing: boolean
  declare private expanded: boolean
  declare private active: number
  declare private announcement: string
  declare private formDisabled: boolean
  private internals = this.attachInternals()
  private messages = new MessagesController(this)
  private known = new Map<string, string>()
  private shown: Item[] = []
  private stopFloating?: () => void

  constructor() {
    super()
    this.label = ''
    this.options = []
    this.value = ''
    this.multiple = false
    this.creatable = false
    this.skipFilter = false
    this.loading = false
    this.disabled = false
    this.name = ''
    this.placeholder = ''
    this.query = ''
    this.editing = false
    this.expanded = false
    this.active = -1
    this.announcement = ''
    this.formDisabled = false
  }

  formResetCallback() {
    this.value = this.multiple ? [] : ''
    this.query = ''
    this.editing = false
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled
  }

  /** Moves the focus to the text input. */
  focus(options?: FocusOptions) {
    this.input?.focus(options)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopFloating?.()
  }

  private get unavailable(): boolean {
    return this.disabled || this.formDisabled
  }

  private get values(): string[] {
    if (Array.isArray(this.value)) {
      return this.value
    }
    return this.value ? [this.value] : []
  }

  private get input(): HTMLInputElement | null {
    return this.renderRoot.querySelector('input')
  }

  private get popup(): HTMLElement | null {
    return this.renderRoot.querySelector('[popover]')
  }

  private labelOf(value: string): string {
    return this.known.get(value) ?? value
  }

  private items(): Item[] {
    if (this.loading) {
      return []
    }
    const typed = this.editing ? this.query.trim() : ''
    const needle = foldText(typed)
    const matching = this.skipFilter || !needle ? this.options : this.options.filter((option) => foldText(option.label).includes(needle))
    const items = matching.map((option, index) => ({ value: option.value, label: option.label, id: `option-${index}`, create: false }))
    const known = [...this.options.map((option) => option.label), ...this.values.map((value) => this.labelOf(value))]
    if (this.creatable && typed && !known.some((label) => sameText(label, typed))) {
      items.push({ value: typed, label: this.messages.format('comboboxCreate', { value: typed }), id: 'option-create', create: true })
    }
    return items
  }

  protected willUpdate(changed: PropertyValues) {
    if (changed.has('options')) {
      this.options.forEach((option) => this.known.set(option.value, option.label))
    }
    this.shown = this.items()
    if (changed.has('query') || changed.has('options') || changed.has('loading')) {
      this.active = this.editing && this.query.trim() && this.shown.length ? 0 : -1
    }
    this.active = Math.min(this.active, this.shown.length - 1)
    if (this.expanded && !this.loading && ['query', 'options', 'loading', 'expanded'].some((key) => changed.has(key))) {
      const count = this.shown.filter((item) => !item.create).length
      this.announcement = count ? this.messages.format('comboboxResults', { count }) : (this.messages.text('comboboxNoResults') ?? '')
    }
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('value') || changed.has('name') || changed.has('multiple')) {
      this.internals.setFormValue(this.formValue())
    }
    if (changed.has('active') && this.active >= 0) {
      this.renderRoot.querySelector(`#${this.shown[this.active]?.id}`)?.scrollIntoView?.({ block: 'nearest' })
    }
  }

  private formValue(): FormData | string | null {
    const values = this.values
    if (!this.name || !values.length) {
      return null
    }
    if (!this.multiple) {
      return values[0] ?? null
    }
    const data = new FormData()
    values.forEach((value) => data.append(this.name, value))
    return data
  }

  private show() {
    const popup = this.popup
    const control = this.renderRoot.querySelector('.control')
    if (this.unavailable || !popup || !control || isPopoverOpen(popup)) {
      return
    }
    popup.showPopover()
    this.stopFloating = float(control, popup, { placement: 'bottom-start', gap: 4, matchWidth: true })
  }

  private hide() {
    if (isPopoverOpen(this.popup)) {
      this.popup?.hidePopover()
    }
  }

  private onToggle(event: ToggleEvent) {
    this.expanded = event.newState === 'open'
    if (!this.expanded) {
      this.active = -1
      this.stopFloating?.()
      this.stopFloating = undefined
    }
  }

  private setQuery(query: string) {
    if (query !== this.query) {
      this.query = query
      emit<SearchDetail>(this, 'lu-search', { query })
    }
  }

  private resetQuery() {
    this.editing = false
    this.setQuery('')
  }

  private change(value: ComboboxValue, source: ValueChangeSource) {
    if (emit<ValueChangeDetail<ComboboxValue>>(this, 'lu-value-change', { value, source }, { cancelable: true })) {
      this.value = value
    }
  }

  private choose(item: Item) {
    if (item.create) {
      this.known.set(item.value, item.value)
    }
    const source: ValueChangeSource = item.create ? 'create' : 'option'
    if (this.multiple) {
      const values = this.values
      this.change(values.includes(item.value) ? values.filter((value) => value !== item.value) : [...values, item.value], source)
    } else {
      this.hide()
      if (item.value !== this.value) {
        this.change(item.value, source)
      }
    }
    this.resetQuery()
  }

  private clearSingle(): boolean {
    if (this.multiple || !this.editing || this.query.trim() || !this.values.length) {
      return false
    }
    this.change('', 'clear')
    return true
  }

  private onInput(event: Event) {
    this.editing = true
    this.setQuery((event.target as HTMLInputElement).value)
    this.show()
  }

  private onKeydown(event: KeyboardEvent) {
    const items = this.shown
    const open = isPopoverOpen(this.popup)
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        if (open) {
          this.active = nextIndex(event.key, this.active, items.length) ?? -1
          return
        }
        this.show()
        if (!event.altKey) {
          const selected = items.findIndex((item) => this.values.includes(item.value))
          this.active = event.key === 'ArrowUp' ? items.length - 1 : Math.max(0, selected)
          this.active = Math.min(this.active, items.length - 1)
        }
        return
      }
      case 'Home':
      case 'End':
        if (open && this.active >= 0) {
          event.preventDefault()
          this.active = nextIndex(event.key, this.active, items.length) ?? -1
        }
        return
      case 'Enter': {
        const item = open ? items[this.active] : undefined
        if (item) {
          event.preventDefault()
          this.choose(item)
        } else if (this.clearSingle()) {
          event.preventDefault()
          this.resetQuery()
        }
        return
      }
      case 'Escape':
        if (open || this.editing) {
          event.preventDefault()
          this.hide()
          this.resetQuery()
        }
        return
      case 'Tab':
        this.hide()
        return
      case 'Backspace':
        if (this.multiple && !this.query && this.values.length) {
          event.preventDefault()
          this.change(this.values.slice(0, -1), 'remove')
        }
        return
    }
  }

  private onBlur() {
    this.hide()
    if (this.editing) {
      this.clearSingle()
      this.resetQuery()
    }
  }

  private onControlClick(event: MouseEvent) {
    if (event.composedPath().some((node) => node instanceof Element && node.localName === 'lu-tag')) {
      return
    }
    this.input?.focus()
    this.show()
  }

  private onTagRemove(event: CustomEvent<RemoveDetail>) {
    event.stopPropagation()
    this.change(
      this.values.filter((value) => value !== event.detail.value),
      'remove',
    )
    this.input?.focus()
  }

  private keepFocus(event: MouseEvent) {
    event.preventDefault()
  }

  private renderItem(item: Item, index: number) {
    const selected = !item.create && this.values.includes(item.value)
    return html`
      <div id=${item.id} role="option" class=${index === this.active ? 'active' : ''} aria-selected=${String(selected)} @click=${() => this.choose(item)}>
        <span class="mark">${selected ? html`<lu-icon name="check"></lu-icon>` : item.create ? html`<lu-icon name="add"></lu-icon>` : nothing}</span>${item.label}
      </div>
    `
  }

  private renderMessage() {
    if (this.loading) {
      return html`<p class="message"><lu-icon class="lu-spin" name="loading"></lu-icon>${this.messages.text('loading') ?? nothing}</p>`
    }
    if (this.expanded && !this.shown.some((item) => !item.create)) {
      return html`<p class="message">${this.messages.text('comboboxNoResults') ?? nothing}</p>`
    }
    return nothing
  }

  render() {
    const label = requiredLabel(this, this.label, 'label')
    const values = this.values
    const active = this.shown[this.active]
    const text = this.editing || this.multiple ? this.query : this.labelOf(values[0] ?? '')
    return html`
      <div class="control ${this.unavailable ? 'disabled' : ''}" part="control" @click=${this.onControlClick}>
        ${this.multiple
          ? repeat(
              values,
              (value) => `${value}\u0000${this.labelOf(value)}`,
              (value) => html`<lu-tag removable value=${value} ?disabled=${this.unavailable} @lu-remove=${this.onTagRemove}>${this.labelOf(value)}</lu-tag>`,
            )
          : nothing}
        <input
          part="input"
          role="combobox"
          autocomplete="off"
          aria-label=${label ?? nothing}
          aria-autocomplete="list"
          aria-expanded=${String(this.expanded)}
          aria-controls="listbox"
          aria-activedescendant=${active?.id ?? nothing}
          placeholder=${this.placeholder || nothing}
          .value=${live(text)}
          ?disabled=${this.unavailable}
          @input=${this.onInput}
          @keydown=${this.onKeydown}
          @blur=${this.onBlur}
        />
        <lu-icon class="chevron" name="chevron-down"></lu-icon>
      </div>
      <div popover="manual" part="popup" @toggle=${this.onToggle} @mousedown=${this.keepFocus}>
        <div
          id="listbox"
          role="listbox"
          part="listbox"
          aria-label=${this.label || nothing}
          aria-multiselectable=${this.multiple ? 'true' : nothing}
          ?hidden=${!this.shown.length}
        >
          ${this.shown.map((item, index) => this.renderItem(item, index))}
        </div>
        ${this.renderMessage()}
      </div>
      <div class="lu-visually-hidden" role="status" aria-atomic="true">${this.announcement}</div>
    `
  }
}

define('lu-combobox', LumenCombobox)

declare global {
  interface HTMLElementTagNameMap {
    'lu-combobox': LumenCombobox
  }
}
