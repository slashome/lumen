import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const colors = [
  'background',
  'foreground',
  'muted',
  'muted-foreground',
  'border',
  'popover',
  'sidebar',
  'primary',
  'primary-foreground',
  'ring',
  'accent',
  'halo',
  'overlay',
  'danger',
  'success',
  'warning',
  'info',
  'highlight',
]

const meta: Meta = { title: 'Foundations/Tokens' }
export default meta

export const Colors: StoryObj = {
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(10rem,1fr));gap:1rem;font-size:0.8rem">
      ${colors.map(
        (name) => html`
          <figure style="margin:0">
            <div style="block-size:3rem;border:1px solid var(--lu-color-border);border-radius:var(--lu-radius-md);background:var(--lu-color-${name})"></div>
            <figcaption><code>--lu-color-${name}</code></figcaption>
          </figure>
        `,
      )}
    </div>
  `,
}

export const Light: StoryObj = {
  render: () => html`
    <p>Every action lights up for a moment, then gets its color back; the state is read from the color, never from the light.</p>
    <button class="lu-button" @click=${(event: Event) => import('../src/lib/light').then(({ light }) => light(event.currentTarget as Element))}>Click me</button>
    <input type="checkbox" role="switch" class="lu-switch" aria-label="Sub-nodes"
      @click=${(event: Event) => import('../src/lib/light').then(({ light }) => light(event.currentTarget as Element))} />
  `,
}
