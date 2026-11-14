import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../testing/mount'
import type { FilesChangeDetail } from '../../lib/change'
import type { LumenFileDrop, RejectDetail } from './file-drop'
import { accepts } from './accept'
import './file-drop'

afterEach(() => {
  document.body.innerHTML = ''
})

const pdf = new File(['%PDF'], 'report.pdf', { type: 'application/pdf', lastModified: 1 })
const png = new File(['png'], 'photo.png', { type: 'image/png', lastModified: 2 })
const exe = new File(['exe'], 'setup.exe', { type: 'application/octet-stream', lastModified: 3 })

function zone(drop: LumenFileDrop) {
  return drop.shadowRoot!.querySelector<HTMLElement>('[part="zone"]')!
}

function dropOn(drop: LumenFileDrop, files: File[]) {
  const event = new Event('drop', { bubbles: true, cancelable: true })
  Object.assign(event, { dataTransfer: { types: ['Files'], files } })
  zone(drop).dispatchEvent(event)
  return event
}

function pick(drop: LumenFileDrop, files: File[]) {
  const input = drop.shadowRoot!.querySelector('input')!
  Object.defineProperty(input, 'files', { value: files, configurable: true })
  input.dispatchEvent(new Event('change'))
}

function record<Detail>(drop: LumenFileDrop, name: string) {
  const details: Detail[] = []
  drop.addEventListener(name, (event) => details.push((event as CustomEvent<Detail>).detail))
  return details
}

describe('accepts', () => {
  it('matches extensions, exact MIME types and MIME wildcards, and everything when empty', () => {
    expect(accepts('', exe)).toBe(true)
    expect(accepts('.PDF', pdf)).toBe(true)
    expect(accepts('image/*', png)).toBe(true)
    expect(accepts('image/*, .pdf', exe)).toBe(false)
    expect(accepts('application/pdf', pdf)).toBe(true)
  })
})

describe('lu-file-drop', () => {
  it('holds the files dropped, after a cancelable lu-files-change', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Attachments" multiple></lu-file-drop>')
    const changes = record<FilesChangeDetail>(drop, 'lu-files-change')
    const event = dropOn(drop, [pdf, png])
    await drop.updateComplete
    expect(event.defaultPrevented).toBe(true)
    expect(changes).toEqual([{ files: [pdf, png], source: 'drop' }])
    expect(drop.files).toEqual([pdf, png])
    expect([...drop.shadowRoot!.querySelectorAll('li .name')].map((name) => name.textContent)).toEqual(['report.pdf', 'photo.png'])
  })

  it('adds the files picked to those held when multiple, without duplicates', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Attachments" multiple></lu-file-drop>')
    pick(drop, [pdf])
    pick(drop, [pdf, png])
    await drop.updateComplete
    expect(drop.files).toEqual([pdf, png])
  })

  it('replaces the file held without multiple, and refuses the extra ones', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Avatar"></lu-file-drop>')
    const rejects = record<RejectDetail>(drop, 'lu-reject')
    pick(drop, [pdf])
    dropOn(drop, [png, exe])
    await drop.updateComplete
    expect(drop.files).toEqual([png])
    expect(rejects).toEqual([{ files: [{ file: exe, reason: 'count' }] }])
  })

  it('refuses a file that accept does not allow, and fires no change when nothing is left', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Attachments" accept=".pdf,image/*" multiple></lu-file-drop>')
    const changes = record<FilesChangeDetail>(drop, 'lu-files-change')
    const rejects = record<RejectDetail>(drop, 'lu-reject')
    dropOn(drop, [exe])
    pick(drop, [exe, pdf])
    await drop.updateComplete
    expect(rejects).toEqual([{ files: [{ file: exe, reason: 'type' }] }, { files: [{ file: exe, reason: 'type' }] }])
    expect(changes).toEqual([{ files: [pdf], source: 'picker' }])
    expect(drop.files).toEqual([pdf])
  })

  it('removes a file with its button', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Attachments" multiple></lu-file-drop>')
    drop.files = [pdf, png]
    await drop.updateComplete
    const changes = record<FilesChangeDetail>(drop, 'lu-files-change')
    drop.shadowRoot!.querySelector<HTMLButtonElement>('li button')!.click()
    await drop.updateComplete
    expect(changes).toEqual([{ files: [png], source: 'remove' }])
    expect(drop.files).toEqual([png])
  })

  it('keeps its files when a listener cancels lu-files-change', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Attachments" multiple></lu-file-drop>')
    const seen: File[][] = []
    drop.addEventListener('lu-files-change', (event) => {
      seen.push(drop.files)
      event.preventDefault()
    })
    dropOn(drop, [pdf])
    await drop.updateComplete
    expect(seen).toEqual([[]])
    expect(drop.files).toEqual([])
  })

  it('ignores drops while disabled, and drags that carry no files', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Attachments" disabled></lu-file-drop>')
    const changes = record<FilesChangeDetail>(drop, 'lu-files-change')
    expect(dropOn(drop, [pdf]).defaultPrevented).toBe(true)
    drop.disabled = false
    const text = new Event('drop', { bubbles: true, cancelable: true })
    Object.assign(text, { dataTransfer: { types: ['text/plain'], files: [] } })
    zone(drop).dispatchEvent(text)
    await drop.updateComplete
    expect(text.defaultPrevented).toBe(false)
    expect(changes).toEqual([])
    expect(drop.shadowRoot!.querySelector('input')!.disabled).toBe(false)
  })

  it('names its input with label and the visible button text', async () => {
    const drop = await mount<LumenFileDrop>('<lu-file-drop label="Attachments" browse-label="Browse" accept="image/*"></lu-file-drop>')
    const input = drop.shadowRoot!.querySelector('input')!
    const names = input
      .getAttribute('aria-labelledby')!
      .split(' ')
      .map((id) => drop.shadowRoot!.getElementById(id)!.textContent)
    expect(names).toEqual(['Attachments', 'Browse'])
    expect(input.type).toBe('file')
    expect(input.accept).toBe('image/*')
  })
})
