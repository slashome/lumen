import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, recordEvents } from '../../../stories/play'
import type { LumenFileDrop } from './file-drop'

const meta: Meta = {
  title: 'Form/File drop',
  component: 'lu-file-drop',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/file-drop'" } },
}
export default meta

const pdf = () => new File(['%PDF-1.7'], 'report.pdf', { type: 'application/pdf' })
const png = () => new File(['png'], 'photo.png', { type: 'image/png' })
const exe = () => new File(['exe'], 'setup.exe', { type: 'application/octet-stream' })

function drag(target: Element, type: 'dragenter' | 'dragover' | 'dragleave' | 'drop', files: File[]) {
  const dataTransfer = new DataTransfer()
  files.forEach((file) => dataTransfer.items.add(file))
  const event = new DragEvent(type, { dataTransfer, bubbles: true, composed: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

function names(host: LumenFileDrop) {
  return [...(host.shadowRoot?.querySelectorAll('li .name') ?? [])].map((name) => name.textContent)
}

export const Default: StoryObj = {
  render: () => html`<lu-file-drop label="Attachments" accept=".pdf,image/*" multiple style="max-inline-size:28rem"></lu-file-drop>`,
  play: async ({ canvasElement, userEvent, step }) => {
    const host = canvasElement.querySelector<LumenFileDrop>('lu-file-drop')!
    const zone = inShadow(host, '[part="zone"]')
    const input = inShadow<HTMLInputElement>(host, 'input')
    const status = inShadow(host, '[role="status"]')
    const changes = recordEvents(canvasElement, 'lu-files-change')
    const rejects = recordEvents(canvasElement, 'lu-reject')

    await expect(input).toHaveAccessibleName('Attachments Choose files')

    await step('A click on the zone opens the system picker of the hidden input', async () => {
      let opened = 0
      input.addEventListener(
        'click',
        (event) => {
          opened += 1
          event.preventDefault()
        },
        { once: true },
      )
      await userEvent.click(zone)
      await expect(opened).toBe(1)
    })

    await step('Focusing the element focuses its input, which Space or Enter opens, and rings the zone', async () => {
      input.blur()
      host.focus()
      await expect(host.shadowRoot?.activeElement).toBe(input)
      await expect(getComputedStyle(zone).outlineStyle).toBe('solid')
    })

    await step('Files chosen in the picker are listed and announced', async () => {
      await userEvent.upload(input, [pdf()])
      await expect(changes).toHaveBeenCalledTimes(1)
      await expect(changes.mock.calls[0]?.[0].source).toBe('picker')
      await waitFor(() => expect(names(host)).toEqual(['report.pdf']))
      await expect(status).toHaveTextContent('1 file added.')
    })

    await step('Dragging files over the zone highlights it, dropping adds them', async () => {
      drag(zone, 'dragenter', [png()])
      await waitFor(() => expect(zone).toHaveClass('over'))
      const dropped = drag(zone, 'drop', [png()])
      await expect(dropped.defaultPrevented).toBe(true)
      await waitFor(() => expect(names(host)).toEqual(['report.pdf', 'photo.png']))
      await expect(zone).not.toHaveClass('over')
      await expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ source: 'drop' }))
    })

    await step('A file of a type not accepted is refused and announced', async () => {
      drag(zone, 'drop', [exe()])
      await expect(rejects).toHaveBeenCalledTimes(1)
      await expect(rejects.mock.calls[0]?.[0].files.map(({ file, reason }: { file: File; reason: string }) => [file.name, reason])).toEqual([['setup.exe', 'type']])
      await expect(changes).toHaveBeenCalledTimes(2)
      await waitFor(() => expect(status).toHaveTextContent('setup.exe is not accepted.'))
      await expect(names(host)).toEqual(['report.pdf', 'photo.png'])
    })

    await step('The remove button of a file removes it with the keyboard, and the focus stays in the list', async () => {
      const remove = inShadow<HTMLButtonElement>(host, 'li button')
      await expect(remove).toHaveAccessibleName('Remove report.pdf')
      remove.focus()
      await userEvent.keyboard('{Enter}')
      await waitFor(() => expect(names(host)).toEqual(['photo.png']))
      await expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ source: 'remove' }))
      await expect(status).toHaveTextContent('report.pdf removed.')
      await expect(host.shadowRoot?.activeElement).toHaveAccessibleName('Remove photo.png')
    })
  },
}

export const Single: StoryObj = {
  parameters: {
    docs: { description: { story: 'Without `multiple`, a new file replaces the one held, and every file after the first of a drop is refused.' } },
  },
  render: () => html`<lu-file-drop label="Avatar" accept="image/*" style="max-inline-size:28rem"></lu-file-drop>`,
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<LumenFileDrop>('lu-file-drop')!
    const zone = inShadow(host, '[part="zone"]')
    const rejects = recordEvents(canvasElement, 'lu-reject')
    drag(zone, 'drop', [png(), new File(['png'], 'second.png', { type: 'image/png' })])
    await waitFor(() => expect(names(host)).toEqual(['photo.png']))
    await expect(rejects.mock.calls[0]?.[0].files.map(({ file, reason }: { file: File; reason: string }) => [file.name, reason])).toEqual([['second.png', 'count']])
  },
}

export const In_a_form: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'With a `name`, the files are part of the form: `new FormData(form)` holds them, a submit sends them, a reset empties the element. The label above is the visible one; the element is named by its own `label`, since a `<label for>` outside cannot reach its input.',
      },
    },
  },
  render: () => html`
    <form style="display:grid;gap:0.75rem;max-inline-size:28rem" @submit=${(event: SubmitEvent) => event.preventDefault()}>
      <div class="lu-field">
        <span class="lu-field__label" aria-hidden="true">Attachments</span>
        <lu-file-drop label="Attachments" name="attachments" multiple></lu-file-drop>
        <p class="lu-field__hint">Logs, screenshots, anything that helps.</p>
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="lu-button" type="submit">Send</button>
        <button class="lu-button lu-button--outline" type="reset">Reset</button>
      </div>
    </form>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const form = canvasElement.querySelector('form')!
    const host = canvasElement.querySelector<LumenFileDrop>('lu-file-drop')!
    const zone = inShadow(host, '[part="zone"]')

    await step('The files dropped are in the form data under the name', async () => {
      drag(zone, 'drop', [pdf(), png()])
      await waitFor(() => expect(new FormData(form).getAll('attachments').map((file) => (file as File).name)).toEqual(['report.pdf', 'photo.png']))
    })

    await step('A reset of the form empties the element', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Reset' }))
      await waitFor(() => expect(host.files).toEqual([]))
      await expect(new FormData(form).getAll('attachments')).toEqual([])
    })
  },
}

export const Disabled: StoryObj = {
  render: () => html`
    <fieldset disabled style="border:0;padding:0;margin:0;max-inline-size:28rem">
      <lu-file-drop label="Attachments" multiple></lu-file-drop>
    </fieldset>
  `,
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<LumenFileDrop>('lu-file-drop')!
    const changes = recordEvents(canvasElement, 'lu-files-change')
    await waitFor(() => expect(inShadow<HTMLInputElement>(host, 'input')).toBeDisabled())
    drag(inShadow(host, '[part="zone"]'), 'drop', [pdf()])
    await expect(changes).not.toHaveBeenCalled()
    await expect(host.files).toEqual([])
  },
}
