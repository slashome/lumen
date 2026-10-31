import { css, html, LitElement, type PropertyValues } from 'lit'
import type { ValueChangeDetail } from '../../lib/change'
import { emit } from '../../lib/emit'
import { float } from '../../lib/floating'
import { isPopoverOpen } from '../../lib/popover'
import { define } from '../../lib/define'
import { nextIndex, typeahead } from '../../lib/list-navigation'
import { LumenOption } from './option'
import { popoverStyles } from '../../lib/styles'
import '../icon/icon'

export type { ValueChangeDetail, ValueChangeSource } from '../../lib/change'

/**
 * A single-choice select on the ARIA combobox and listbox pattern: a button that opens a list of `lu-option` in the top layer, with arrow keys, Home, End and typeahead.
 *
 * The select fires `lu-value-change` when the user picks an option, then sets its own `value` unless a listener cancels the event.
 *
 * @summary A single-choice list of options behind a button.
 * @tag lu-select
 * @slot - The `lu-option` elements.
 * @slot display - What the button shows, when the label of the selected option is not enough.
 * @csspart trigger - The button that opens the list.
 * @csspart listbox - The floating list of options.
 * @fires {CustomEvent<ValueChangeDetail>} lu-value-change - The user picked an option other than the current one. `detail.value` is its value, `detail.source` is `option`. Cancelable: `preventDefault()` keeps the current `value`, which the element still holds while the event runs; the list closes either way.
 */
export class LumenSelect extends LitElement {
  static properties = {
    label: {},
    value: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    expanded: { state: true },
    selectedLabel: { state: true },
  }

  static styles = [
    popoverStyles,
    css`
      :host {
        display: inline-flex;
      }

      .trigger {
        display: inline-flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        gap: var(--lu-space-2);
        min-inline-size: 0;
        block-size: var(--lu-control-height);
        padding-inline: var(--lu-space-2-5);
        border: 1px solid var(--lu-color-border);
        border-radius: var(--lu-radius-md);
        background: var(--lu-color-background);
        color: inherit;
        font: inherit;
        font-size: var(--lu-font-size-sm);
        text-align: start;
        cursor: pointer;
      }

      .trigger:focus-visible {
        outline: 2px solid var(--lu-color-ring);
        outline-offset: 0;
      }

      .trigger:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .value {
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chevron {
        color: var(--lu-color-muted-foreground);
      }

      [popover] {
        box-sizing: border-box;
        min-inline-size: var(--lu-anchor-width);
        max-block-size: min(32rem, var(--lu-available-height, 32rem));
        padding: var(--lu-space-1);
        overflow-y: auto;
      }
    `,
  ]

  /** The accessible name of the select and of its list. */
  declare label: string
  /** The value of the selected option. An empty string, or a value no option has, selects nothing. */
  declare value: string
  /** Whether the select ignores the user. */
  declare disabled: boolean
  declare private expanded: boolean
  declare private selectedLabel: string
  private query = ''
  private queryTimer?: ReturnType<typeof setTimeout>
  private stopFloating?: () => void

  constructor() {
    super()
    this.label = ''
    this.value = ''
    this.disabled = false
    this.expanded = false
    this.selectedLabel = ''
  }

  /** The `lu-option` children, in document order. */
  get options(): LumenOption[] {
    return [...this.querySelectorAll('lu-option')]
  }

  private get enabledOptions(): LumenOption[] {
    return this.options.filter((option) => !option.disabled)
  }

  private get trigger(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('.trigger')
  }

  private get listbox(): HTMLElement | null {
    return this.renderRoot.querySelector('[popover]')
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) {
      this.syncOptions()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopFloating?.()
  }

  private syncOptions() {
    let label = ''
    for (const option of this.options) {
      option.selected = option.value === this.value
      if (option.selected) {
        label = option.label
      }
    }
    this.selectedLabel = label
  }

  private open() {
    const listbox = this.listbox
    const trigger = this.trigger
    if (!listbox || !trigger || this.disabled) {
      return
    }
    listbox.showPopover()
    this.stopFloating = float(trigger, listbox, { placement: 'bottom-start', gap: 4, matchWidth: true })
    const selected = this.enabledOptions.find((option) => option.selected) ?? this.enabledOptions[0]
    selected?.focus()
  }

  private close() {
    if (isPopoverOpen(this.listbox)) {
      this.listbox?.hidePopover()
    }
    this.trigger?.focus()
  }

  private onToggle(event: ToggleEvent) {
    this.expanded = event.newState === 'open'
    if (!this.expanded) {
      this.stopFloating?.()
      this.stopFloating = undefined
    }
  }

  private choose(option: LumenOption) {
    if (option.disabled) {
      return
    }
    this.close()
    if (option.value !== this.value && emit<ValueChangeDetail>(this, 'lu-value-change', { value: option.value, source: 'option' }, { cancelable: true })) {
      this.value = option.value
    }
  }

  private onTriggerKeydown(event: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      this.open()
    }
  }

  private onListKeydown(event: KeyboardEvent) {
    const options = this.enabledOptions
    const current = options.findIndex((option) => option === document.activeElement || option.matches(':focus'))
    const target = nextIndex(event.key, current, options.length)
    if (target !== null) {
      event.preventDefault()
      options[target]?.focus()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[current]
      if (option) {
        this.choose(option)
      }
      return
    }
    if (event.key === 'Tab') {
      this.close()
      return
    }
    if (event.key.length === 1) {
      clearTimeout(this.queryTimer)
      this.query += event.key
      this.queryTimer = setTimeout(() => (this.query = ''), 600)
      const found = typeahead(
        options.map((option) => option.label),
        this.query,
        this.query.length > 1 ? current - 1 : current,
      )
      options[found]?.focus()
    }
  }

  private onListClick(event: MouseEvent) {
    const option = event.composedPath().find((node): node is LumenOption => node instanceof LumenOption)
    if (option) {
      this.choose(option)
    }
  }

  render() {
    return html`
      <button
        type="button"
        class="trigger"
        part="trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${String(this.expanded)}
        aria-label=${this.label}
        ?disabled=${this.disabled}
        @click=${this.open}
        @keydown=${this.onTriggerKeydown}
      >
        <span class="value"><slot name="display">${this.selectedLabel}</slot></span>
        <lu-icon class="chevron" name="chevron-down"></lu-icon>
      </button>
      <div popover="auto" role="listbox" part="listbox" aria-label=${this.label} @toggle=${this.onToggle} @keydown=${this.onListKeydown} @click=${this.onListClick}>
        <slot @slotchange=${this.syncOptions}></slot>
      </div>
    `
  }
}

define('lu-select', LumenSelect)

declare global {
  interface HTMLElementTagNameMap {
    'lu-select': LumenSelect
  }
}
