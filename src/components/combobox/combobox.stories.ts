import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, isOpen, recordEvents } from '../../../stories/play'
import type { LumenTag } from '../tag/tag'
import type { ComboboxOption, LumenCombobox, SearchDetail } from './combobox'

const meta: Meta = {
  title: 'Form/Combobox',
  component: 'lu-combobox',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/combobox'" } },
}
export default meta

const languages: ComboboxOption[] = [
  { value: 'de', label: 'German' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
]

const people: ComboboxOption[] = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'alan', label: 'Alan Turing' },
  { value: 'grace', label: 'Grace Hopper' },
  { value: 'katherine', label: 'Katherine Johnson' },
  { value: 'linus', label: 'Linus Torvalds' },
  { value: 'margaret', label: 'Margaret Hamilton' },
]

function host(canvasElement: HTMLElement) {
  return canvasElement.querySelector<LumenCombobox>('lu-combobox')!
}

function parts(element: LumenCombobox) {
  const input = inShadow<HTMLInputElement>(element, 'input')
  const popup = inShadow(element, '[part="popup"]')
  const options = () => [...(element.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])]
  const labels = () => options().map((option) => option.textContent?.trim())
  const active = () => element.shadowRoot?.getElementById(input.getAttribute('aria-activedescendant') ?? '')?.textContent?.trim()
  const status = inShadow(element, '[role="status"]')
  const tags = () => [...(element.shadowRoot?.querySelectorAll<LumenTag>('lu-tag') ?? [])]
  return { input, popup, options, labels, active, status, tags }
}

export const Default: StoryObj = {
  render: () => html`<lu-combobox label="Language" placeholder="Pick a language" .options=${languages} style="max-inline-size:20rem"></lu-combobox>`,
  play: async ({ canvasElement, userEvent, step }) => {
    const element = host(canvasElement)
    const { input, popup, labels, active, status } = parts(element)
    const changes = recordEvents(canvasElement, 'lu-value-change')
    const searches = recordEvents(canvasElement, 'lu-search')

    await expect(input).toHaveRole('combobox')
    await expect(input).toHaveAccessibleName('Language')
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    await step('ArrowDown opens the list on its first option, the focus stays in the field', async () => {
      element.focus()
      await userEvent.keyboard('{ArrowDown}')
      await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'))
      await expect(isOpen(popup)).toBe(true)
      await expect(active()).toBe('German')
      await expect(element.shadowRoot?.activeElement).toBe(input)
      await expect(status).toHaveTextContent('6 results.')
    })

    await step('The arrow keys, Home and End move the active option', async () => {
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      await expect(active()).toBe('Spanish')
      await userEvent.keyboard('{End}')
      await expect(active()).toBe('Portuguese')
      await userEvent.keyboard('{Home}')
      await expect(active()).toBe('German')
    })

    await step('Typing filters the options, ignoring case, and activates the first match', async () => {
      await userEvent.type(input, 'EN')
      await waitFor(() => expect(labels()).toEqual(['English', 'French']))
      await expect(active()).toBe('English')
      await expect(status).toHaveTextContent('2 results.')
      await expect(searches.mock.calls.map(([detail]) => (detail as SearchDetail).query)).toEqual(['E', 'EN'])
    })

    await step('Enter picks the active option, closes the list and shows its label', async () => {
      await userEvent.keyboard('{ArrowDown}{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ value: 'fr', source: 'option' })
      await waitFor(() => expect(input).toHaveValue('French'))
      await expect(isOpen(popup)).toBe(false)
      await expect(element.value).toBe('fr')
    })

    await step('Escape closes the list and gives back the label of the value', async () => {
      await userEvent.type(input, 'ital', { initialSelectionStart: 0, initialSelectionEnd: input.value.length })
      await waitFor(() => expect(isOpen(popup)).toBe(true))
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(isOpen(popup)).toBe(false))
      await expect(input).toHaveValue('French')
      await expect(changes).toHaveBeenCalledTimes(1)
    })

    await step('Nothing matching says so, Tab closes the list and moves on', async () => {
      await userEvent.type(input, 'zz')
      await waitFor(() => expect(inShadow(element, '.message')).toHaveTextContent('No results'))
      await expect(status).toHaveTextContent('No results')
      await userEvent.keyboard('{Tab}')
      await waitFor(() => expect(isOpen(popup)).toBe(false))
      await expect(input).toHaveValue('French')
    })

    await step('A click on an option picks it', async () => {
      await userEvent.click(input)
      await waitFor(() => expect(isOpen(popup)).toBe(true))
      await userEvent.click(parts(element).options().find((option) => option.textContent?.trim() === 'Italian')!)
      await expect(changes).toHaveBeenLastCalledWith({ value: 'it', source: 'option' })
      await waitFor(() => expect(input).toHaveValue('Italian'))
    })

    await step('Reopened, the list marks the value as selected and starts on it', async () => {
      await userEvent.keyboard('{ArrowDown}')
      await waitFor(() => expect(isOpen(popup)).toBe(true))
      await expect(active()).toBe('Italian')
      await expect(parts(element).options().find((option) => option.textContent?.trim() === 'Italian')).toHaveAttribute('aria-selected', 'true')
    })
  },
}

export const Multiple: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'With `multiple`, the values are removable tags, picking an option adds it or removes it and keeps the list open, and Backspace in the empty field removes the last value.',
      },
    },
  },
  render: () => html`<lu-combobox label="Languages" multiple .options=${languages} .value=${['fr', 'en']} style="max-inline-size:24rem"></lu-combobox>`,
  play: async ({ canvasElement, userEvent, step }) => {
    const element = host(canvasElement)
    const { input, popup, options, tags } = parts(element)
    const changes = recordEvents(canvasElement, 'lu-value-change')
    const removes = recordEvents(document, 'lu-remove')
    const tagTexts = () => tags().map((tag) => tag.textContent)

    await expect(tagTexts()).toEqual(['French', 'English'])

    await step('Picking an option adds it as a tag and keeps the list open', async () => {
      await userEvent.click(input)
      await userEvent.type(input, 'ger')
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ value: ['fr', 'en', 'de'], source: 'option' })
      await waitFor(() => expect(tagTexts()).toEqual(['French', 'English', 'German']))
      await expect(input).toHaveValue('')
      await expect(isOpen(popup)).toBe(true)
      await expect(inShadow(element, '[role="listbox"]')).toHaveAttribute('aria-multiselectable', 'true')
    })

    await step('Picking a selected option removes it', async () => {
      const english = options().find((option) => option.textContent?.trim() === 'English')!
      await expect(english).toHaveAttribute('aria-selected', 'true')
      await userEvent.click(english)
      await expect(changes).toHaveBeenLastCalledWith({ value: ['fr', 'de'], source: 'option' })
      await waitFor(() => expect(tagTexts()).toEqual(['French', 'German']))
    })

    await step('Backspace in the empty field removes the last value', async () => {
      await userEvent.keyboard('{Backspace}')
      await expect(changes).toHaveBeenLastCalledWith({ value: ['fr'], source: 'remove' })
      await waitFor(() => expect(tagTexts()).toEqual(['French']))
    })

    await step('The remove button of a tag removes its value and gives the focus back to the field', async () => {
      const remove = inShadow(tags()[0]!, '[part="remove"]')
      await expect(remove).toHaveAccessibleName('Remove French')
      await userEvent.click(remove)
      await expect(changes).toHaveBeenLastCalledWith({ value: [], source: 'remove' })
      await waitFor(() => expect(tags()).toHaveLength(0))
      await expect(element.shadowRoot?.activeElement).toBe(input)
      await expect(removes).not.toHaveBeenCalled()
    })
  },
}

function searchPeople(event: CustomEvent<SearchDetail>) {
  const element = event.currentTarget as LumenCombobox
  const query = event.detail.query.toLowerCase()
  element.loading = true
  setTimeout(() => {
    if (element.dataset.query === query) {
      element.options = people.filter((person) => person.label.toLowerCase().includes(query))
      element.loading = false
    }
  }, 150)
  element.dataset.query = query
}

export const Loaded_by_the_application: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'With `skip-filter`, the application loads the options: it listens to `lu-search`, fired on every change of the text without delay, sets `loading`, then `options`. Debouncing and cancelling a request that came too late are its own business; this one keeps only the answer to the last text.',
      },
    },
  },
  render: () => html`<lu-combobox label="Assignee" skip-filter .options=${people} @lu-search=${searchPeople} style="max-inline-size:20rem"></lu-combobox>`,
  play: async ({ canvasElement, userEvent, step }) => {
    const element = host(canvasElement)
    const { input, labels, active, status } = parts(element)
    const searches = recordEvents(canvasElement, 'lu-search')

    await step('The text typed is sent to the application, which loads the options', async () => {
      await userEvent.click(input)
      await userEvent.type(input, 'ace')
      await expect(searches).toHaveBeenLastCalledWith({ query: 'ace' })
      await waitFor(() => expect(inShadow(element, '.message')).toHaveTextContent('Loading…'))
      await expect(labels()).toEqual([])
      await waitFor(() => expect(labels()).toEqual(['Ada Lovelace', 'Grace Hopper']))
      await expect(active()).toBe('Ada Lovelace')
      await expect(status).toHaveTextContent('2 results.')
    })

    await step('The element shows the options as given, without filtering them again', async () => {
      element.options = [{ value: 'grace', label: 'Grace Hopper' }]
      await waitFor(() => expect(labels()).toEqual(['Grace Hopper']))
    })

    await step('The value keeps its label once the options have changed', async () => {
      await userEvent.keyboard('{Enter}')
      await waitFor(() => expect(input).toHaveValue('Grace Hopper'))
      await expect(searches).toHaveBeenLastCalledWith({ query: '' })
      await waitFor(() => expect(element.loading).toBe(false))
      await expect(element.value).toBe('grace')
      await expect(input).toHaveValue('Grace Hopper')
    })
  },
}

export const Creatable: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'With `creatable`, a text that matches no option is offered as a value of its own, by the `comboboxCreate` message; `lu-value-change` says `create`.',
      },
    },
  },
  render: () => html`<lu-combobox label="Labels" multiple creatable .options=${[{ value: 'design', label: 'Design' }, { value: 'bug', label: 'Bug' }]} style="max-inline-size:24rem"></lu-combobox>`,
  play: async ({ canvasElement, userEvent, step }) => {
    const element = host(canvasElement)
    const { input, labels, tags } = parts(element)
    const changes = recordEvents(canvasElement, 'lu-value-change')

    await step('A text an option matches offers no creation', async () => {
      await userEvent.click(input)
      await userEvent.type(input, 'design')
      await waitFor(() => expect(labels()).toEqual(['Design']))
    })

    await step('A new text is offered as a value, and Enter creates it', async () => {
      await userEvent.type(input, 'Performance', { initialSelectionStart: 0, initialSelectionEnd: input.value.length })
      await waitFor(() => expect(labels()).toEqual(['Create “Performance”']))
      await expect(inShadow(element, '.message')).toHaveTextContent('No results')
      await userEvent.keyboard('{Enter}')
      await expect(changes).toHaveBeenLastCalledWith({ value: ['Performance'], source: 'create' })
      await waitFor(() => expect(tags().map((tag) => tag.textContent)).toEqual(['Performance']))
    })

    await step('A value already held is not offered again', async () => {
      await expect(input).toHaveValue('')
      input.value = 'performance'
      input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
      await waitFor(() => expect(labels()).toEqual([]))
    })
  },
}

export const In_a_form: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'With a `name`, the values are part of the form, one entry each: `new FormData(form)` holds them, a submit sends them, a reset empties the element.',
      },
    },
  },
  render: () => html`
    <form style="display:grid;gap:0.75rem;max-inline-size:24rem" @submit=${(event: SubmitEvent) => event.preventDefault()}>
      <div class="lu-field">
        <span class="lu-field__label" aria-hidden="true">Languages</span>
        <lu-combobox label="Languages" name="languages" multiple .options=${languages} .value=${['fr', 'it']}></lu-combobox>
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="lu-button" type="submit">Save</button>
        <button class="lu-button lu-button--outline" type="reset">Reset</button>
      </div>
    </form>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const form = canvasElement.querySelector('form')!
    const element = host(canvasElement)

    await step('The values are in the form data under the name', async () => {
      await waitFor(() => expect(new FormData(form).getAll('languages')).toEqual(['fr', 'it']))
    })

    await step('A reset of the form empties the element', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Reset' }))
      await waitFor(() => expect(element.value).toEqual([]))
      await expect(new FormData(form).getAll('languages')).toEqual([])
    })
  },
}

export const Disabled: StoryObj = {
  render: () => html`
    <fieldset disabled style="border:0;padding:0;margin:0;max-inline-size:20rem">
      <lu-combobox label="Language" .options=${languages} value="fr"></lu-combobox>
    </fieldset>
  `,
  play: async ({ canvasElement }) => {
    const element = host(canvasElement)
    await waitFor(() => expect(inShadow<HTMLInputElement>(element, 'input')).toBeDisabled())
    await expect(inShadow(element, 'input')).toHaveValue('French')
  },
}
