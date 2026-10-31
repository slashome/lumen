import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, waitFor } from 'storybook/test'
import { createApp, h, ref } from 'vue'
import type { LumenSelect } from '../src/components/select/select'
import { Button, Select, SelectItem } from '../src/react'
import { inShadow } from './play'

const meta: Meta = {
  title: 'Foundations/Frameworks',
  parameters: {
    docs: {
      description: {
        component: 'The same `lu-select` and `.lu-button`, from plain HTML, from React through `@slashome/lumen/react`, and from Vue with no adapter.',
      },
    },
  },
}
export default meta

const statuses = ['backlog', 'todo', 'done']

function ReactDemo() {
  const [status, setStatus] = useState('todo')
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Select label="Status (React)" value={status} onValueChange={setStatus}>
        {statuses.map((entry) => (
          <SelectItem key={entry} value={entry}>
            {entry}
          </SelectItem>
        ))}
      </Select>
      <Button variant="outline" onClick={() => setStatus('todo')}>
        Reset
      </Button>
      <output>{status}</output>
    </div>
  )
}

const VueDemo = {
  setup() {
    const status = ref('todo')
    return () =>
      h('div', { style: 'display:flex;gap:0.5rem;align-items:center' }, [
        h(
          'lu-select',
          { label: 'Status (Vue)', value: status.value, onLuValueChange: (event: CustomEvent<{ value: string }>) => (status.value = event.detail.value) },
          statuses.map((entry) => h('lu-option', { value: entry }, entry)),
        ),
        h('button', { class: 'lu-button lu-button--outline', onClick: () => (status.value = 'todo') }, 'Reset'),
        h('output', null, status.value),
      ])
  },
}

function section(title: string) {
  return html`<h3 style="margin:1.5rem 0 0.5rem;font-size:0.875rem">${title}</h3>`
}

export const Side_by_side: StoryObj = {
  render: () => {
    const reactHost = document.createElement('div')
    createRoot(reactHost).render(<ReactDemo />)
    const vueHost = document.createElement('div')
    createApp(VueDemo).mount(vueHost)
    return html`
      ${section('Plain HTML')}
      <div style="display:flex;gap:0.5rem;align-items:center">
        <lu-select label="Status (HTML)" value="todo" @lu-value-change=${(event: CustomEvent<{ value: string }>) => {
          const output = (event.currentTarget as HTMLElement).parentElement?.querySelector('output')
          if (output) output.textContent = event.detail.value
        }}>
          ${statuses.map((entry) => html`<lu-option value=${entry}>${entry}</lu-option>`)}
        </lu-select>
        <output>todo</output>
      </div>
      ${section('React 19')} ${reactHost} ${section('Vue 3')} ${vueHost}
    `
  },
  play: async ({ canvasElement, userEvent, step }) => {
    const selectNamed = async (label: string) => {
      let found: LumenSelect | undefined
      await waitFor(() => {
        found = [...canvasElement.querySelectorAll<LumenSelect>('lu-select')].find((select) => select.label === label)
        expect(found).toBeDefined()
      })
      return found as LumenSelect
    }

    for (const framework of ['HTML', 'React', 'Vue']) {
      await step(`${framework} receives lu-value-change and shows the picked value`, async () => {
        const select = await selectNamed(`Status (${framework})`)
        const output = select.parentElement?.querySelector('output')
        await waitFor(() => expect(output).toHaveTextContent('todo'))
        await userEvent.click(inShadow(select, '[part="trigger"]'))
        await userEvent.click(select.querySelector('lu-option[value="done"]') as HTMLElement)
        await waitFor(() => expect(output).toHaveTextContent('done'))
      })
    }
  },
}
