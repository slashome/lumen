import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import manifest from '../custom-elements.json'
import { registerDemoMessages } from '../stories/messages'
import { toast, toasts } from './lib/toast'
import './index'

interface Case {
  tag: string
  bare: string
  labelled: string
  missing: string[]
  act?: (element: HTMLElement) => Promise<void> | void
}

const registryKey = Symbol.for('@slashome/lumen/messages')

function press(target: Element, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))
}

const dragArea = (draggable: string) => `<lu-drag-area>
  <lu-drop-zone zone-id="todo" label="To do"><lu-draggable drag-id="T104" ${draggable}>T104</lu-draggable></lu-drop-zone>
  <lu-drop-zone zone-id="done" label="Done"></lu-drop-zone>
  <lu-draggable drag-id="T105" ${draggable}>T105</lu-draggable>
</lu-drag-area>`

const missingDrag = ['no label for "dragPickedUp"', 'no label for "dragOver"', 'no label for "dragCancelled"', 'no label for "dragDropped"', 'no label for "dragDroppedOutside"']

const cases: Case[] = [
  { tag: 'lu-dialog', bare: '<lu-dialog></lu-dialog>', labelled: '<lu-dialog heading="Edit"></lu-dialog>', missing: ['needs heading', 'no label for "close"'] },
  { tag: 'lu-sheet', bare: '<lu-sheet></lu-sheet>', labelled: '<lu-sheet><span slot="heading">T104</span></lu-sheet>', missing: ['needs heading', 'no label for "close"'] },
  {
    tag: 'lu-confirm-dialog',
    bare: '<lu-confirm-dialog></lu-confirm-dialog>',
    labelled: '<lu-confirm-dialog heading="Delete T104?"></lu-confirm-dialog>',
    missing: ['needs heading', 'no label for "confirm"', 'no label for "cancel"'],
  },
  {
    tag: 'lu-toaster',
    bare: '<lu-toaster></lu-toaster>',
    labelled: '<lu-toaster></lu-toaster>',
    missing: ['no label for "notifications"', 'no label for "close"'],
    act: () => void toast('Saved'),
  },
  {
    tag: 'lu-multi-select',
    bare: '<lu-multi-select></lu-multi-select>',
    labelled: '<lu-multi-select label="Kind"></lu-multi-select>',
    missing: ['needs label', 'no label for "clear"'],
    act: (element) => Object.assign(element, { options: [{ value: 'bug', label: 'Bug' }], selected: ['bug'] }),
  },
  {
    tag: 'lu-select',
    bare: '<lu-select><lu-option value="a">Alpha</lu-option></lu-select>',
    labelled: '<lu-select label="Status"><lu-option value="a">Alpha</lu-option></lu-select>',
    missing: ['needs label'],
  },
  { tag: 'lu-option', bare: '<lu-option value="a">Alpha</lu-option>', labelled: '<lu-option value="a">Alpha</lu-option>', missing: [] },
  {
    tag: 'lu-segmented',
    bare: '<lu-segmented></lu-segmented>',
    labelled: '<lu-segmented label="Size"></lu-segmented>',
    missing: ['needs label'],
    act: (element) => Object.assign(element, { values: ['S', 'M'] }),
  },
  {
    tag: 'lu-tabs',
    bare: '<lu-tabs><button slot="tab" value="a">A</button><div>Panel</div></lu-tabs>',
    labelled: '<lu-tabs label="Item"><button slot="tab" value="a">A</button><div>Panel</div></lu-tabs>',
    missing: ['needs label'],
  },
  {
    tag: 'lu-draggable',
    bare: '<lu-draggable drag-id="T104">T104</lu-draggable>',
    labelled: '<lu-draggable drag-id="T104">T104</lu-draggable>',
    missing: ['no label for "draggable"'],
  },
  {
    tag: 'lu-drag-area',
    bare: dragArea(''),
    labelled: dragArea(''),
    missing: missingDrag,
    act: (element) => {
      const [inZone, outside] = element.querySelectorAll('lu-draggable')
      press(inZone!, ' ')
      press(inZone!, 'ArrowRight')
      press(inZone!, 'Escape')
      press(inZone!, ' ')
      press(inZone!, ' ')
      press(outside!, ' ')
      press(outside!, ' ')
    },
  },
  {
    tag: 'lu-file-drop',
    bare: '<lu-file-drop></lu-file-drop>',
    labelled: '<lu-file-drop label="Attachments"></lu-file-drop>',
    missing: ['needs label', 'no label for "fileDrop"', 'no label for "fileBrowse"', 'no label for "fileRemove"', 'no label for "filesAdded"', 'no label for "fileRemoved"', 'no label for "fileRejected"'],
    act: async (element) => {
      const drop = (files: File[]) => {
        const event = new Event('drop', { bubbles: true, cancelable: true })
        Object.assign(event, { dataTransfer: { types: ['Files'], files } })
        element.shadowRoot!.querySelector('[part="zone"]')!.dispatchEvent(event)
      }
      element.setAttribute('accept', '.pdf')
      drop([new File([''], 'notes.txt'), new File([''], 'report.pdf')])
      await (element as Updatable).updateComplete
      element.shadowRoot!.querySelector<HTMLButtonElement>('li button')!.click()
    },
  },
  { tag: 'lu-tag', bare: '<lu-tag removable>Design</lu-tag>', labelled: '<lu-tag removable>Design</lu-tag>', missing: ['no label for "tagRemove"'] },
  { tag: 'lu-drop-zone', bare: '<lu-drop-zone zone-id="todo"></lu-drop-zone>', labelled: '<lu-drop-zone zone-id="todo" label="To do"></lu-drop-zone>', missing: [] },
  {
    tag: 'lu-tooltip',
    bare: '<lu-tooltip>Copy the command</lu-tooltip>',
    labelled: '<lu-tooltip for="copy">Copy the command</lu-tooltip><button id="copy">Copy</button>',
    missing: ['needs for'],
  },
  {
    tag: 'lu-hover-card',
    bare: '<lu-hover-card><p>Commit</p></lu-hover-card>',
    labelled: '<lu-hover-card for="changes"><p>Commit</p></lu-hover-card><button id="changes">3 changes</button>',
    missing: ['needs for'],
  },
  { tag: 'lu-icon', bare: '<lu-icon name="copy"></lu-icon>', labelled: '<lu-icon name="copy" label="Copy"></lu-icon>', missing: [] },
  { tag: 'lu-highlight', bare: '<lu-highlight text="Paint"></lu-highlight>', labelled: '<lu-highlight text="Paint"></lu-highlight>', missing: [] },
  { tag: 'lu-markdown', bare: '<lu-markdown source="Paint"></lu-markdown>', labelled: '<lu-markdown source="Paint"></lu-markdown>', missing: [] },
]

const tags = (manifest.modules as { declarations?: { tagName?: string }[] }[]).flatMap((module) => module.declarations ?? []).flatMap((declaration) => declaration.tagName ?? [])

type Updatable = HTMLElement & { updateComplete?: Promise<boolean> }

function lumenElements(root: ParentNode): Updatable[] {
  return [...root.querySelectorAll<Updatable>('*')].filter((element) => element.localName.startsWith('lu-'))
}

async function settle() {
  for (let round = 0; round < 3; round += 1) {
    await Promise.all(lumenElements(document.body).map((element) => element.updateComplete))
    await new Promise((resolve) => setTimeout(resolve))
  }
}

async function render(item: Case, markup: string) {
  document.body.innerHTML = markup
  const element = document.body.firstElementChild as HTMLElement
  await settle()
  await item.act?.(element)
  await settle()
  return element
}

function errorsOf(spy: ConsoleSpy, tag: string): string[] {
  return spy.mock.calls.map(([message]: unknown[]) => String(message)).filter((message: string) => message.startsWith(`[lumen] <${tag}>`))
}

const needsName = [
  'button',
  'dialog',
  'section[aria-label]',
  '[role="button"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="tablist"]',
  '[role="tab"]',
  '[role="group"]',
  '[role="region"]',
  '[role="option"]',
].join(', ')

function flatText(node: Node): string {
  if (node instanceof HTMLSlotElement) {
    const assigned = node.assignedNodes({ flatten: true })
    return (assigned.length ? assigned : [...node.childNodes]).map(flatText).join('')
  }
  if (node instanceof Element && node.shadowRoot) {
    return [...node.shadowRoot.childNodes].map(flatText).join('')
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }
  return [...node.childNodes].map(flatText).join('')
}

function accessibleName(element: Element): string {
  const label = element.getAttribute('aria-label')
  if (label !== null) {
    return label.trim()
  }
  const root = element.getRootNode() as Document | ShadowRoot
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => (root.getElementById(id) ? flatText(root.getElementById(id)!) : ''))
      .join(' ')
      .trim()
  }
  return flatText(element).trim()
}

function namedThings(root: ParentNode): Element[] {
  const own = [...root.querySelectorAll(needsName)]
  const shadows = [...root.querySelectorAll('*')].flatMap((element) => (element.shadowRoot ? namedThings(element.shadowRoot) : []))
  return [...own, ...shadows]
}

function describeElement(element: Element): string {
  const host = (element.getRootNode() as ShadowRoot).host
  return `${host ? `${host.localName} > ` : ''}${element.localName}${element.getAttribute('role') ? `[role=${element.getAttribute('role')}]` : ''}`
}

type ConsoleSpy = ReturnType<typeof spyOnErrors>

function spyOnErrors() {
  return vi.spyOn(console, 'error').mockImplementation(() => {})
}

let error: ConsoleSpy

beforeEach(() => {
  toasts.set([])
  error = spyOnErrors()
})

afterEach(() => {
  document.body.innerHTML = ''
  toasts.set([])
  vi.restoreAllMocks()
  registerDemoMessages()
  document.documentElement.lang = 'en'
})

describe('labels', () => {
  it('covers every element of the manifest', () => {
    expect(cases.map((item) => item.tag).sort()).toEqual([...tags].sort())
  })

  describe('without any label', () => {
    beforeEach(() => {
      delete (globalThis as unknown as Record<symbol, unknown>)[registryKey]
      document.documentElement.lang = 'de'
    })

    it.each(cases.map((item) => [item.tag, item] as const))('%s reports each label it lacks', async (tag, item) => {
      await render(item, item.bare)
      const reported = errorsOf(error, tag)
      for (const expected of item.missing) {
        expect(reported.filter((message) => message.includes(expected)), expected).toHaveLength(1)
      }
      expect(reported).toHaveLength(item.missing.length)
    })
  })

  describe('with the demonstration messages', () => {
    it.each(cases.map((item) => [item.tag, item] as const))('%s leaves no accessible name empty', async (_, item) => {
      const element = await render(item, item.labelled)
      expect(error).not.toHaveBeenCalled()
      const unnamed = namedThings(document.body)
        .filter((candidate) => !accessibleName(candidate))
        .map(describeElement)
      expect(unnamed).toEqual([])
      for (const draggable of [element, ...element.querySelectorAll('*')].filter((candidate) => candidate.localName === 'lu-draggable')) {
        expect(draggable.getAttribute('aria-roledescription')?.trim()).toBeTruthy()
      }
    })
  })
})
