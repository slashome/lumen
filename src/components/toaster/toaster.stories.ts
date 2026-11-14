import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { toast, toasts } from '../../lib/toast'
import { inShadow, isOpen } from '../../../stories/play'

const meta: Meta = {
  title: 'Feedback/Toaster',
  component: 'lu-toaster',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/toaster'" } },
}
export default meta

export const Default: StoryObj = {
  render: () => html`
    <lu-toaster></lu-toaster>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <button class="lu-button lu-button--outline" @click=${() => toast.success('T104 planned: todo')}>Success</button>
      <button class="lu-button lu-button--outline" @click=${() => toast.danger('The workflow has no status in the todo category')}>Danger</button>
      <button class="lu-button lu-button--outline" @click=${() => toast.info('Pulled 3 commits')}>Info</button>
      <button class="lu-button lu-button--outline" @click=${() => toast.warning('The branch has diverged')}>Warning</button>
    </div>
  `,
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    toasts.get().forEach((entry) => toast.dismiss(entry.id))
    const host = canvasElement.querySelector('lu-toaster')
    const region = inShadow(host, '[part="region"]')
    const announcer = inShadow(host, '[aria-live="polite"]')
    const shown = () => [...region.querySelectorAll<HTMLElement>('[part="toast"]')]
    await waitFor(() => expect(isOpen(region)).toBe(false))

    await step('Each toast shows in the region and is announced', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Success' }))
      await waitFor(() => expect(shown()).toHaveLength(1))
      await expect(isOpen(region)).toBe(true)
      await expect(region).toHaveAccessibleName('Notifications')
      await expect(shown()[0]).toHaveAttribute('data-kind', 'success')
      await expect(shown()[0]).toHaveTextContent('T104 planned: todo')
      await expect(announcer).toHaveTextContent('T104 planned: todo')

      await userEvent.click(canvas.getByRole('button', { name: 'Danger' }))
      await waitFor(() => expect(shown()).toHaveLength(2))
      await expect(shown()[1]).toHaveAttribute('data-kind', 'danger')
      await expect(announcer).toHaveTextContent('The workflow has no status in the todo category')
    })

    await step('The close button of a toast dismisses only that one, and the region hides when empty', async () => {
      await userEvent.click(inShadow(host, '[part="toast"] .close'))
      await waitFor(() => expect(shown()).toHaveLength(1))
      await expect(shown()[0]).toHaveAttribute('data-kind', 'danger')
      await userEvent.click(inShadow(host, '[part="toast"] .close'))
      await waitFor(() => expect(shown()).toHaveLength(0))
      await expect(isOpen(region)).toBe(false)
    })

    await step('A toast closes by itself after its duration', async () => {
      toast.info('Pulled 3 commits', { duration: 300 })
      await waitFor(() => expect(shown()).toHaveLength(1))
      await waitFor(() => expect(shown()).toHaveLength(0))
    })
  },
}
