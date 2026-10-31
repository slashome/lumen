import { css, html, LitElement, nothing } from 'lit'
import { emit } from '../lib/emit'
import { float } from '../lib/floating'
import { define } from './define'
import { nextIndex } from './list-navigation'
import { buttonStyles, popoverStyles } from './styles'
import './icon'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface SelectedChangeDetail {
  selected: string[]
}

export class LumenMultiSelect extends LitElement {
  static properties = {
    label: {},
    options: { type: Array },
    selected: { type: Array },
    clearLabel: { attribute: 'clear-label' },
    expanded: { state: true },
  }

  static styles = [
    buttonStyles,
    popoverStyles,
    css`
      :host {
        display: inline-flex;
      }

      .count {
        padding-inline: var(--lu-space-1);
        border-radius: var(--lu-radius-sm);
        background: var(--lu-color-muted);
        font-size: var(--lu-font-size-xs);
      }

      .chevron {
        --lu-icon-size: 0.875rem;
        opacity: 0.6;
      }

      [popover] {
        min-inline-size: 11rem;
        padding: var(--lu-space-1);
      }

      .item {
        display: flex;
        align-items: center;
        gap: var(--lu-space-2);
        inline-size: 100%;
        padding: var(--lu-space-1-5) var(--lu-space-2);
        border: 0;
        border-radius: var(--lu-radius-sm);
        background: none;
        color: inherit;
        font: inherit;
        text-align: start;
        cursor: pointer;
        outline: none;
      }

      .item:hover,
      .item:focus {
        background: var(--lu-color-muted);
      }

      .box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1rem;
        block-size: 1rem;
        border: 1px solid var(--lu-color-border);
        border-radius: var(--lu-radius-sm);
        --lu-icon-size: 0.75rem;
      }

      .clear {
        color: var(--lu-color-muted-foreground);
      }

      hr {
        margin-block: var(--lu-space-1);
        border: 0;
        border-block-start: 1px solid var(--lu-color-border);
      }
    `,
  ]

  declare label: string
  declare options: MultiSelectOption[]
  declare selected: string[]
  declare clearLabel: string
  declare private expanded: boolean
  private stopFloating?: () => void

  constructor() {
    super()
    this.label = ''
    this.options = []
    this.selected = []
    this.clearLabel = 'Clear'
    this.expanded = false
  }

  private get trigger(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('.trigger')
  }

  private get menu(): HTMLElement | null {
    return this.renderRoot.querySelector('[popover]')
  }

  private get items(): HTMLButtonElement[] {
    return [...this.renderRoot.querySelectorAll<HTMLButtonElement>('.item')]
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopFloating?.()
  }

  private open() {
    const menu = this.menu
    const trigger = this.trigger
    if (!menu || !trigger) {
      return
    }
    menu.showPopover()
    this.stopFloating = float(trigger, menu, { placement: 'bottom-start', gap: 4 })
    this.items[0]?.focus()
  }

  private onToggle(event: ToggleEvent) {
    this.expanded = event.newState === 'open'
    if (!this.expanded) {
      this.stopFloating?.()
      this.stopFloating = undefined
    }
  }

  private change(selected: string[]) {
    this.selected = selected
    emit<SelectedChangeDetail>(this, 'lu-selected-change', { selected })
  }

  private toggle(value: string) {
    this.change(this.selected.includes(value) ? this.selected.filter((entry) => entry !== value) : [...this.selected, value])
  }

  private clear() {
    this.change([])
    this.menu?.hidePopover()
    this.trigger?.focus()
  }

  private onTriggerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      this.open()
    }
  }

  private onMenuKeydown(event: KeyboardEvent) {
    const items = this.items
    const current = items.findIndex((item) => item.matches(':focus'))
    const target = nextIndex(event.key, current, items.length)
    if (target !== null) {
      event.preventDefault()
      items[target]?.focus()
    } else if (event.key === 'Tab') {
      this.menu?.hidePopover()
    }
  }

  render() {
    return html`
      <button
        type="button"
        class="trigger lu-button lu-button--outline lu-button--sm"
        part="trigger"
        aria-haspopup="menu"
        aria-expanded=${String(this.expanded)}
        @click=${this.open}
        @keydown=${this.onTriggerKeydown}
      >
        ${this.label} ${this.selected.length > 0 ? html`<span class="count">${this.selected.length}</span>` : nothing}
        <lu-icon class="chevron" name="chevron-down"></lu-icon>
      </button>
      <div popover="auto" role="menu" part="menu" aria-label=${this.label} @toggle=${this.onToggle} @keydown=${this.onMenuKeydown}>
        ${this.options.map(
          (option) => html`
            <button
              type="button"
              class="item"
              role="menuitemcheckbox"
              tabindex="-1"
              aria-checked=${String(this.selected.includes(option.value))}
              @click=${() => this.toggle(option.value)}
            >
              <span class="box">${this.selected.includes(option.value) ? html`<lu-icon name="check"></lu-icon>` : nothing}</span>
              ${option.label}
            </button>
          `,
        )}
        ${this.selected.length > 0
          ? html`<hr /><button type="button" class="item clear" role="menuitem" tabindex="-1" @click=${this.clear}>${this.clearLabel}</button>`
          : nothing}
      </div>
    `
  }
}

define('lu-multi-select', LumenMultiSelect)

declare global {
  interface HTMLElementTagNameMap {
    'lu-multi-select': LumenMultiSelect
  }
}
