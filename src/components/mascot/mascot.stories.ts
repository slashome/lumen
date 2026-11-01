import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import './mascot'

const meta: Meta = {
  title: 'Feedback/Mascot',
  component: 'lu-mascot',
  tags: ['autodocs'],
  parameters: { docs: { subtitle: "Custom element · import '@slashome/lumen/mascot'" } },
}
export default meta

const sizes = [24, 48, 96, 160]

const row = (variant: string) => html`
  <div style="display:flex;gap:2rem;align-items:end;flex-wrap:wrap">
    ${sizes.map(
      (size) => html`<figure style="display:grid;justify-items:center;gap:0.5rem;margin:0">
        <lu-mascot variant=${variant} style="--lu-mascot-size:${size}px"></lu-mascot>
        <figcaption style="font-size:0.75rem;color:var(--lu-color-muted-foreground)">${variant} · ${size} px</figcaption>
      </figure>`,
    )}
  </div>
`

const sheet = () => html`<div style="display:grid;gap:2rem;padding:1.5rem;background:var(--lu-color-background)">${row('default')} ${row('empty')}</div>`

export const Sizes: StoryObj = { render: sheet }

export const Dark: StoryObj = { render: sheet, globals: { appearance: 'dark' } }

const themes = [
  { name: 'Fuchsia and amber', primary: '#c026d3', accent: '#f59e0b' },
  { name: 'Green and sky', primary: '#16a34a', accent: '#0ea5e9' },
]

export const Themes: StoryObj = {
  render: () => html`
    <div style="display:grid;gap:2rem;padding:1.5rem;background:var(--lu-color-background)">
      ${themes.map(
        ({ name, primary, accent }) => html`<section aria-label=${name} style="display:grid;gap:1rem;--lu-color-primary:${primary};--lu-color-accent:${accent}">
          <h3 style="margin:0;font-size:0.875rem">${name}</h3>
          ${row('default')}
        </section>`,
      )}
    </div>
  `,
}
