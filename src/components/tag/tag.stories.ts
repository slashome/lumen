import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, recordEvents } from '../../../stories/play'
import type { LumenTag, RemoveDetail } from './tag'

const meta: Meta = {
  title: 'Data/Tag',
  component: 'lu-tag',
  tags: ['autodocs'],
  parameters: {
    docs: {
      subtitle: "CSS class · no JavaScript, or custom element · import '@slashome/lumen/tag'",
      description: {
        component: `A value the user chose or typed: a label, a person, a filter. A tag that cannot be removed is the CSS class \`.lu-tag\` on a \`<span>\`; a tag the user removes is \`<lu-tag removable>\`.

| Class | Use |
| --- | --- |
| \`.lu-tag\` | The tag, on a muted fill with a border. Unlike \`.lu-badge\`, which states a status, a tag holds a value. |

\`<lu-tag removable>\` fires \`lu-remove\` and stays in place: the owner removes the value from its data, which removes the tag, and moves the focus to the next tag or back to its field. Its remove button is named by the \`tagRemove\` message, given the text of the tag. In React, \`Tag\` from \`@slashome/lumen/react\` draws the class without \`onRemove\` and the element with it.`,
      },
    },
  },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
      <span class="lu-tag">Design</span>
      <span class="lu-tag">Accessibility</span>
      <span class="lu-tag">Performance</span>
    </div>
  `,
}

function removeOnRequest(event: CustomEvent<RemoveDetail>) {
  const tag = event.target as LumenTag
  const tags = [...(tag.parentElement?.querySelectorAll('lu-tag') ?? [])]
  const next = tags[tags.indexOf(tag) + 1] ?? tags[tags.indexOf(tag) - 1]
  tag.remove()
  if (next) {
    next.shadowRoot?.querySelector<HTMLButtonElement>('[part="remove"]')?.focus()
  } else {
    document.querySelector<HTMLButtonElement>('#add-tag')?.focus()
  }
}

export const Removable: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'The owner listens to `lu-remove`, removes the tag and moves the focus to the next one, or to the previous one when it was the last.',
      },
    },
  },
  render: () => html`
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center" @lu-remove=${removeOnRequest}>
      <lu-tag removable value="design">Design</lu-tag>
      <lu-tag removable value="a11y">Accessibility</lu-tag>
      <lu-tag removable value="perf">Performance</lu-tag>
      <lu-tag removable disabled value="locked">Locked</lu-tag>
      <button id="add-tag" class="lu-button lu-button--ghost lu-button--sm" type="button">Add a tag</button>
    </div>
  `,
  play: async ({ canvasElement, userEvent, step }) => {
    const tag = (value: string) => canvasElement.querySelector<LumenTag>(`lu-tag[value="${value}"]`)
    const removes = recordEvents(canvasElement, 'lu-remove')

    await step('The remove button is named after the tag', async () => {
      await expect(inShadow(tag('design'), '[part="remove"]')).toHaveAccessibleName('Remove Design')
    })

    await step('A click asks the owner to remove the tag, which the owner does', async () => {
      await userEvent.click(inShadow(tag('design'), '[part="remove"]'))
      await expect(removes).toHaveBeenLastCalledWith({ value: 'design' })
      await waitFor(() => expect(tag('design')).toBeNull())
      await expect(tag('a11y')?.shadowRoot?.activeElement).toBe(inShadow(tag('a11y'), '[part="remove"]'))
    })

    await step('Delete and Backspace on the remove button ask the same', async () => {
      await userEvent.keyboard('{Delete}')
      await expect(removes).toHaveBeenLastCalledWith({ value: 'a11y' })
      await waitFor(() => expect(tag('a11y')).toBeNull())
      await expect(tag('perf')?.shadowRoot?.activeElement).toBe(inShadow(tag('perf'), '[part="remove"]'))
      await userEvent.keyboard('{Backspace}')
      await expect(removes).toHaveBeenLastCalledWith({ value: 'perf' })
      await waitFor(() => expect(tag('perf')).toBeNull())
    })

    await step('A disabled tag asks nothing', async () => {
      await expect(inShadow(tag('locked'), '[part="remove"]')).toBeDisabled()
      await expect(removes).toHaveBeenCalledTimes(3)
    })
  },
}
