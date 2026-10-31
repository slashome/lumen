import { css, html, LitElement, type PropertyValues } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { dismiss, toasts, type Toast, type ToastKind } from '../lib/toast'
import { define } from './define'
import { buttonStyles, visuallyHidden } from './styles'
import './icon'

const icons: Record<ToastKind, string | null> = {
  default: null,
  success: 'success',
  error: 'error',
  info: 'info',
  warning: 'warning',
}

export class LumenToaster extends LitElement {
  static properties = {
    closeLabel: { attribute: 'close-label' },
    entries: { state: true },
  }

  static styles = [
    buttonStyles,
    visuallyHidden,
    css`
      :host {
        display: contents;
      }

      [popover] {
        position: fixed;
        inset: auto var(--lumen-space-6) var(--lumen-space-6) auto;
        display: flex;
        flex-direction: column;
        gap: var(--lumen-space-2);
        inline-size: min(22rem, calc(100vw - 2rem));
        margin: 0;
        padding: 0;
        border: 0;
        background: none;
        overflow: visible;
      }

      [popover]:not(:popover-open) {
        display: none;
      }

      .toast {
        --tone: var(--lumen-color-foreground);
        display: flex;
        align-items: flex-start;
        gap: var(--lumen-space-2);
        padding: var(--lumen-space-3) var(--lumen-space-4);
        border: 1px solid color-mix(in oklab, var(--tone) 30%, var(--lumen-color-border));
        border-radius: var(--lumen-radius-lg);
        background: color-mix(in oklab, var(--tone) 8%, var(--lumen-color-popover));
        color: var(--lumen-color-foreground);
        font-family: var(--lumen-font-family-sans);
        font-size: var(--lumen-font-size-sm);
        box-shadow: var(--lumen-shadow-lg);
        animation: enter var(--lumen-motion-hover-duration) var(--lumen-motion-hover-easing);
      }

      .toast[data-kind='success'] { --tone: var(--lumen-color-success); }
      .toast[data-kind='error'] { --tone: var(--lumen-color-danger); }
      .toast[data-kind='info'] { --tone: var(--lumen-color-info); }
      .toast[data-kind='warning'] { --tone: var(--lumen-color-warning); }

      .kind {
        --lumen-icon-size: 1rem;
        margin-block-start: 0.125rem;
        color: var(--tone);
      }

      .message {
        flex: 1;
        overflow-wrap: anywhere;
      }

      .close {
        --lumen-icon-size: 0.875rem;
        inline-size: 1.25rem;
        block-size: 1.25rem;
      }

      @keyframes enter {
        from {
          opacity: 0;
          translate: 0 0.5rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast {
          animation: none;
        }
      }
    `,
  ]

  declare closeLabel: string
  declare private entries: readonly Toast[]
  private stopListening?: () => void
  private timers = new Map<number, ReturnType<typeof setTimeout>>()

  constructor() {
    super()
    this.closeLabel = 'Close'
    this.entries = toasts.get()
  }

  connectedCallback() {
    super.connectedCallback()
    this.stopListening = toasts.subscribe((entries) => (this.entries = entries))
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopListening?.()
    this.timers.forEach((timer) => clearTimeout(timer))
    this.timers.clear()
  }

  private get region(): HTMLElement | null {
    return this.renderRoot.querySelector('[popover]')
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has('entries')) {
      return
    }
    this.entries.forEach((entry) => {
      if (!this.timers.has(entry.id)) {
        this.arm(entry)
      }
    })
    const region = this.region
    if (!region) {
      return
    }
    if (region.matches(':popover-open')) {
      region.hidePopover()
    }
    if (this.entries.length > 0) {
      region.showPopover()
    }
  }

  private arm(entry: Toast) {
    this.timers.set(
      entry.id,
      setTimeout(() => this.close(entry.id), entry.duration),
    )
  }

  private pause(entry: Toast) {
    clearTimeout(this.timers.get(entry.id))
  }

  private resume(entry: Toast) {
    this.arm(entry)
  }

  private close(id: number) {
    clearTimeout(this.timers.get(id))
    this.timers.delete(id)
    dismiss(id)
  }

  private get announcement(): string {
    return this.entries.at(-1)?.message ?? ''
  }

  render() {
    return html`
      <div class="visually-hidden" aria-live="polite" aria-atomic="true">${this.announcement}</div>
      <section popover="manual" aria-label="Notifications" part="region">
        ${repeat(
          this.entries,
          (entry) => entry.id,
          (entry) => html`
            <div
              class="toast"
              part="toast"
              data-kind=${entry.kind}
              @pointerenter=${() => this.pause(entry)}
              @pointerleave=${() => this.resume(entry)}
            >
              ${icons[entry.kind] ? html`<lumen-icon class="kind" name=${icons[entry.kind]}></lumen-icon>` : null}
              <span class="message">${entry.message}</span>
              <button type="button" class="lumen-icon-button close" aria-label=${this.closeLabel} @click=${() => this.close(entry.id)}>
                <lumen-icon name="close"></lumen-icon>
              </button>
            </div>
          `,
        )}
      </section>
    `
  }
}

define('lumen-toaster', LumenToaster)

declare global {
  interface HTMLElementTagNameMap {
    'lumen-toaster': LumenToaster
  }
}
