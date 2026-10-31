import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { expect, waitFor } from 'storybook/test'
import { inShadow, recordEvents } from '../../../stories/play'

const meta: Meta = {
  title: 'Navigation/Tabs',
  component: 'lu-tabs',
  tags: ['autodocs', 'floor-1'],
  parameters: { docs: { subtitle: 'Floor 1 — Lit' } },
}
export default meta

const tabs = (manual = false) => html`
  <lu-tabs label="Item" value="overview" ?manual=${manual}>
    <button slot="tab" value="overview">Overview</button>
    <button slot="tab" value="history">History</button>
    <button slot="tab" value="links" disabled>Links</button>
    <button slot="tab" value="files">Files</button>
    <div><p style="margin:0">The summary of the item.</p></div>
    <div><p style="margin:0">Every change, newest first.</p></div>
    <div><p style="margin:0">The items this one points to.</p></div>
    <div><p style="margin:0">The files attached to the item.</p></div>
  </lu-tabs>
`

export const Default: StoryObj = {
  render: () => tabs(),
  play: async ({ canvas, canvasElement, userEvent, step }) => {
    const changes = recordEvents(canvasElement, 'lu-value-change')
    const tab = (name: string) => canvas.getByRole('tab', { name })
    await expect(inShadow(canvasElement.querySelector('lu-tabs'), '[role="tablist"]')).toHaveAccessibleName('Item')
    await expect(canvas.getByRole('tabpanel', { name: 'Overview' })).toHaveTextContent('The summary of the item.')

    await step('A click selects a tab and shows its panel', async () => {
      await userEvent.click(tab('History'))
      await expect(changes).toHaveBeenLastCalledWith({ value: 'history' })
      await waitFor(() => expect(tab('History')).toHaveAttribute('aria-selected', 'true'))
      await expect(canvas.getByRole('tabpanel', { name: 'History' })).toBeVisible()
    })

    await step('The arrows select the next tab, skip the disabled one, and wrap', async () => {
      await userEvent.keyboard('{ArrowRight}')
      await expect(tab('Files')).toHaveFocus()
      await expect(changes).toHaveBeenLastCalledWith({ value: 'files' })
      await userEvent.keyboard('{ArrowRight}')
      await expect(tab('Overview')).toHaveFocus()
      await userEvent.keyboard('{ArrowLeft}')
      await expect(tab('Files')).toHaveFocus()
    })

    await step('Home and End reach the first and the last tab', async () => {
      await userEvent.keyboard('{Home}')
      await expect(tab('Overview')).toHaveFocus()
      await userEvent.keyboard('{End}')
      await expect(tab('Files')).toHaveFocus()
      await waitFor(() => expect(canvas.getByRole('tabpanel', { name: 'Files' })).toBeVisible())
    })

    await step('Tab leaves the tab list for the panel', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('tabpanel', { name: 'Files' })).toHaveFocus()
    })
  },
}

export const Manual: StoryObj = {
  render: () => tabs(true),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const changes = recordEvents(canvasElement, 'lu-value-change')
    const tab = (name: string) => canvas.getByRole('tab', { name })
    tab('Overview').focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(tab('History')).toHaveFocus()
    await expect(tab('Overview')).toHaveAttribute('aria-selected', 'true')
    await expect(changes).not.toHaveBeenCalled()
    await userEvent.keyboard('{Enter}')
    await expect(changes).toHaveBeenLastCalledWith({ value: 'history' })
    await waitFor(() => expect(tab('History')).toHaveAttribute('aria-selected', 'true'))
  },
}
