import { css, html, LitElement, type PropertyValues } from 'lit'
import { emit } from '../lib/emit'
import { float } from '../lib/floating'
import { define } from './define'
import { nextIndex, typeahead } from './list-navigation'
import { LumenOption } from './option'
import { popoverStyles } from './styles'
import './icon'

export interface ValueChangeDetail<Value = string> {
  value: Value
}

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
        gap: var(--lumen-space-2);
        min-inline-size: 0;
        block-size: var(--lumen-control-height);
        padding-inline: var(--lumen-space-2-5);
        border: 1px solid var(--lumen-color-border);
        border-radius: var(--lumen-radius-md);
        background: var(--lumen-color-background);
        color: inherit;
        font: inherit;
        font-size: var(--lumen-font-size-sm);
        text-align: start;
        cursor: pointer;
      }

      .trigger:focus-visible {
        outline: 2px solid var(--lumen-color-ring);
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
        color: var(--lumen-color-muted-foreground);
      }

      [popover] {
        box-sizing: border-box;
        min-inline-size: var(--lumen-anchor-width);
        max-block-size: min(32rem, var(--lumen-available-height, 32rem));
        padding: var(--lumen-space-1);
        overflow-y: auto;
      }
    `,
  ]

  declare label: string
  declare value: string
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

  get options(): LumenOption[] {
    return [...this.querySelectorAll('lumen-option')]
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
    if (this.listbox?.matches(':popover-open')) {
      this.listbox.hidePopover()
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
    if (option.value !== this.value) {
      this.value = option.value
      emit<ValueChangeDetail>(this, 'lumen-value-change', { value: option.value })
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
        aria-haspopup="listbox"
        aria-expanded=${String(this.expanded)}
        aria-label=${this.label}
        ?disabled=${this.disabled}
        @click=${this.open}
        @keydown=${this.onTriggerKeydown}
      >
        <span class="value"><slot name="display">${this.selectedLabel}</slot></span>
        <lumen-icon class="chevron" name="chevron-down"></lumen-icon>
      </button>
      <div popover="auto" role="listbox" part="listbox" aria-label=${this.label} @toggle=${this.onToggle} @keydown=${this.onListKeydown} @click=${this.onListClick}>
        <slot @slotchange=${this.syncOptions}></slot>
      </div>
    `
  }
}

define('lumen-select', LumenSelect)

declare global {
  interface HTMLElementTagNameMap {
    'lumen-select': LumenSelect
  }
}
