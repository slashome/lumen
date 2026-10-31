import { css, html, LitElement, nothing, type PropertyValues } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import type { FilesChangeDetail, FilesChangeSource } from '../../lib/change'
import { define } from '../../lib/define'
import { emit } from '../../lib/emit'
import { langOf, MessagesController, requiredLabel } from '../../lib/messages'
import { buttonStyles, utilityStyles } from '../../lib/styles'
import { accepts, sameFile } from './accept'
import '../icon/icon'

export type { FilesChangeDetail, FilesChangeSource } from '../../lib/change'

export interface RejectedFile {
  file: File
  reason: 'type' | 'count'
}

export interface RejectDetail {
  files: RejectedFile[]
}

const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const

function formatSize(size: number, lang: string): string {
  const exponent = Math.min(units.length - 1, size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0)
  return new Intl.NumberFormat(lang || undefined, { style: 'unit', unit: units[exponent], unitDisplay: 'short', maximumFractionDigits: 1 }).format(size / 1024 ** exponent)
}

/**
 * A zone where the user drops files, or clicks to choose them with the system picker. It holds the files chosen and lists them, each with a button that removes it; it never uploads anything: the application reads `files`, or the form it belongs to, and sends them.
 *
 * A native `<input type="file">`, visually hidden inside the zone, gives the system picker, the keyboard (Tab reaches it, Space or Enter opens the picker), the camera on a phone when `accept` allows images, and what screen readers say. Its accessible name is `label` followed by the visible button text.
 *
 * The element is form-associated: with a `name`, its files are submitted with the form under that name, a form reset empties it and a disabled fieldset disables it.
 *
 * A file whose type `accept` does not allow, or a second file when `multiple` is absent, is refused: the element fires `lu-reject` and keeps it out. Then it fires `lu-files-change` with the files it will hold, and holds them unless a listener cancels the event.
 *
 * The visible texts are the `fileDrop` and `fileBrowse` messages, the remove buttons are named by `fileRemove`, and the changes are announced with `filesAdded`, `fileRemoved` and `fileRejected`, all registered with `registerLumenMessages()`.
 *
 * @summary A zone to drop or choose files, listed before the application sends them.
 * @tag lu-file-drop
 * @csspart zone - The dashed zone that takes the drop and opens the picker on a click.
 * @csspart button - The button-like text inside the zone.
 * @csspart list - The list of the files chosen.
 * @fires {CustomEvent<FilesChangeDetail>} lu-files-change - The user dropped, chose or removed files. `detail.files` is the list the element will hold, `detail.source` is `drop`, `picker` or `remove`. Cancelable: `preventDefault()` keeps the current `files`, which the element still holds while the event runs.
 * @fires {CustomEvent<RejectDetail>} lu-reject - Files were refused. `detail.files` lists each one with its `reason`: `type` when `accept` does not allow it, `count` for every file after the first when `multiple` is absent. Not cancelable: the element has already kept them out.
 */
export class LumenFileDrop extends LitElement {
  /** @internal Read by the browser to make the element form-associated; the tag keeps it out of custom-elements.json. */
  static formAssociated = true

  /** @internal Read by Lit to send the focus of the element to its input; the tag keeps it out of custom-elements.json. */
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }

  static properties = {
    label: {},
    accept: {},
    multiple: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    files: { attribute: false },
    dropLabel: { attribute: 'drop-label' },
    browseLabel: { attribute: 'browse-label' },
    over: { state: true },
    formDisabled: { state: true },
    announcement: { state: true },
  }

  static styles = [
    buttonStyles,
    utilityStyles,
    css`
      :host {
        display: grid;
        gap: var(--lu-space-2);
        font-size: var(--lu-font-size-sm);
      }

      .zone {
        --lu-icon-size: 1.5rem;
        position: relative;
        display: grid;
        justify-items: center;
        gap: var(--lu-space-2);
        padding: var(--lu-space-6) var(--lu-space-4);
        border: 1px dashed var(--lu-color-border);
        border-radius: var(--lu-radius-lg);
        background: var(--lu-color-background);
        color: var(--lu-color-muted-foreground);
        text-align: center;
        cursor: pointer;
        transition:
          background-color var(--lu-motion-hover-duration) var(--lu-motion-hover-easing),
          border-color var(--lu-motion-hover-duration) var(--lu-motion-hover-easing);
      }

      .zone:hover,
      .zone.over {
        border-color: var(--lu-color-primary);
        background: var(--lu-color-muted);
      }

      .zone.over {
        border-style: solid;
      }

      .zone:has(input:focus-visible) {
        outline: 2px solid var(--lu-color-ring);
        outline-offset: 2px;
      }

      .zone.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .zone.disabled:hover {
        border-color: var(--lu-color-border);
        background: var(--lu-color-background);
      }

      .drop {
        color: var(--lu-color-foreground);
      }

      .zone .lu-button {
        pointer-events: none;
      }

      ul {
        display: grid;
        gap: var(--lu-space-1);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        --lu-icon-size: 1rem;
        display: flex;
        align-items: center;
        gap: var(--lu-space-2);
        min-inline-size: 0;
        padding: var(--lu-space-1) var(--lu-space-1) var(--lu-space-1) var(--lu-space-2-5);
        border: 1px solid var(--lu-color-border);
        border-radius: var(--lu-radius-md);
      }

      .name {
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .size {
        color: var(--lu-color-muted-foreground);
        font-size: var(--lu-font-size-xs);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      @media (prefers-reduced-motion: reduce) {
        .zone {
          transition: none;
        }
      }
    `,
  ]

  /**
   * The accessible name of the file input, what the files are for. Without it, the element logs an error.
   * @required
   */
  declare label: string
  /** The file types allowed, as the `accept` of an input: extensions (`.pdf`) and MIME types (`image/png`, `image/*`), separated by commas. Empty allows every file. */
  declare accept: string
  /** Whether the element holds several files. Without it, a new file replaces the one held. */
  declare multiple: boolean
  /** Whether the element refuses drops and clicks. A disabled `<fieldset>` around it disables it too. */
  declare disabled: boolean
  /** The name its files are submitted under with their form. Without it, the form gets nothing. */
  declare name: string
  /** The files held, in the order they came. Set it to empty the element or to show files chosen before; setting it fires no event. */
  declare files: File[]
  /** The text of the zone, overriding the `fileDrop` message. */
  declare dropLabel: string
  /** The text of the button inside the zone, overriding the `fileBrowse` message. */
  declare browseLabel: string
  declare private over: boolean
  declare private formDisabled: boolean
  declare private announcement: string
  private internals = this.attachInternals()
  private messages = new MessagesController(this)
  private dragDepth = 0
  private focusAfterRemove: number | null = null

  constructor() {
    super()
    this.label = ''
    this.accept = ''
    this.multiple = false
    this.disabled = false
    this.name = ''
    this.files = []
    this.dropLabel = ''
    this.browseLabel = ''
    this.over = false
    this.formDisabled = false
    this.announcement = ''
  }

  formResetCallback() {
    this.files = []
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled
  }

  private get unavailable(): boolean {
    return this.disabled || this.formDisabled
  }

  private carriesFiles(event: DragEvent): boolean {
    return [...(event.dataTransfer?.types ?? [])].includes('Files')
  }

  private onDragEnter(event: DragEvent) {
    if (!this.carriesFiles(event)) {
      return
    }
    event.preventDefault()
    this.dragDepth += 1
    this.over = !this.unavailable
  }

  private onDragOver(event: DragEvent) {
    if (!this.carriesFiles(event)) {
      return
    }
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.unavailable ? 'none' : 'copy'
    }
  }

  private onDragLeave(event: DragEvent) {
    if (!this.carriesFiles(event)) {
      return
    }
    this.dragDepth = Math.max(0, this.dragDepth - 1)
    this.over = this.dragDepth > 0 && !this.unavailable
  }

  private onDrop(event: DragEvent) {
    if (!this.carriesFiles(event)) {
      return
    }
    event.preventDefault()
    this.dragDepth = 0
    this.over = false
    if (!this.unavailable) {
      this.add([...(event.dataTransfer?.files ?? [])], 'drop')
    }
  }

  private onPick(event: Event) {
    const input = event.target as HTMLInputElement
    const picked = [...(input.files ?? [])]
    input.value = ''
    this.add(picked, 'picker')
  }

  private add(incoming: File[], source: FilesChangeSource) {
    const rejected: RejectedFile[] = incoming.filter((file) => !accepts(this.accept, file)).map((file) => ({ file, reason: 'type' }))
    const allowed = incoming.filter((file) => accepts(this.accept, file))
    let next = this.files
    if (this.multiple) {
      const fresh = allowed.filter((file, index) => !this.files.some((held) => sameFile(held, file)) && allowed.findIndex((other) => sameFile(other, file)) === index)
      next = fresh.length ? [...this.files, ...fresh] : this.files
    } else if (allowed.length) {
      next = allowed.slice(0, 1)
      rejected.push(...allowed.slice(1).map((file): RejectedFile => ({ file, reason: 'count' })))
    }
    const said = rejected.map(({ file }) => this.messages.format('fileRejected', { name: file.name }))
    if (rejected.length) {
      emit<RejectDetail>(this, 'lu-reject', { files: rejected })
    }
    if (next !== this.files && emit<FilesChangeDetail>(this, 'lu-files-change', { files: next, source }, { cancelable: true })) {
      const added = next.filter((file) => !this.files.includes(file)).length
      this.files = next
      said.push(this.messages.format('filesAdded', { count: added }))
    }
    this.announce(said)
  }

  private removeFile(file: File, index: number) {
    const next = this.files.filter((held) => held !== file)
    if (emit<FilesChangeDetail>(this, 'lu-files-change', { files: next, source: 'remove' }, { cancelable: true })) {
      this.files = next
      this.focusAfterRemove = Math.min(index, next.length - 1)
      this.announce([this.messages.format('fileRemoved', { name: file.name })])
    }
  }

  private announce(parts: string[]) {
    this.announcement = parts.filter(Boolean).join(' ')
  }

  private formValue(): FormData | null {
    if (!this.name || !this.files.length) {
      return null
    }
    const data = new FormData()
    this.files.forEach((file) => data.append(this.name, file))
    return data
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('files') || changed.has('name')) {
      this.internals.setFormValue(this.formValue())
    }
    if (this.focusAfterRemove !== null) {
      const index = this.focusAfterRemove
      this.focusAfterRemove = null
      const buttons = this.shadowRoot?.querySelectorAll<HTMLButtonElement>('li button')
      ;(index >= 0 ? buttons?.[index] : this.shadowRoot?.querySelector('input'))?.focus()
    }
  }

  render() {
    const lang = langOf(this)
    const name = requiredLabel(this, this.label, 'label')
    return html`
      <label
        class="zone ${this.over ? 'over' : ''} ${this.unavailable ? 'disabled' : ''}"
        part="zone"
        @dragenter=${this.onDragEnter}
        @dragover=${this.onDragOver}
        @dragleave=${this.onDragLeave}
        @drop=${this.onDrop}
      >
        <lu-icon name="upload"></lu-icon>
        <span class="drop">${this.messages.text('fileDrop', this.dropLabel, 'drop-label') ?? nothing}</span>
        <span class="lu-button lu-button--outline lu-button--sm" id="browse" part="button">${this.messages.text('fileBrowse', this.browseLabel, 'browse-label') ?? nothing}</span>
        <span id="name" hidden>${name ?? nothing}</span>
        <input
          class="lu-visually-hidden"
          type="file"
          aria-labelledby="name browse"
          accept=${this.accept || nothing}
          ?multiple=${this.multiple}
          ?disabled=${this.unavailable}
          @change=${this.onPick}
        />
      </label>
      ${this.files.length
        ? html`<ul part="list">
            ${repeat(
              this.files,
              (file) => file,
              (file, index) => html`
                <li>
                  <lu-icon name="file"></lu-icon>
                  <span class="name">${file.name}</span>
                  <span class="size">${formatSize(file.size, lang)}</span>
                  <button
                    type="button"
                    class="lu-icon-button"
                    aria-label=${this.messages.format('fileRemove', { name: file.name })}
                    ?disabled=${this.unavailable}
                    @click=${() => this.removeFile(file, index)}
                  >
                    <lu-icon name="close"></lu-icon>
                  </button>
                </li>
              `,
            )}
          </ul>`
        : nothing}
      <div class="lu-visually-hidden" role="status" aria-atomic="true">${this.announcement}</div>
    `
  }
}

define('lu-file-drop', LumenFileDrop)

declare global {
  interface HTMLElementTagNameMap {
    'lu-file-drop': LumenFileDrop
  }
}
