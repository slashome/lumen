import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

const meta: Meta = { title: 'Floor 1 (Lit)/Elements' }
export default meta

export const Markdown: StoryObj = {
  render: () =>
    html`<lu-markdown
      .source=${'## Découpage\n\n1. [T104](T104.md) — le jeton\n2. [T999](T999.md) — un lien mort\n\nSee [the spec](https://github.com/slashome/ariane).\n\n| Key | Value |\n| --- | --- |\n| status | `todo` |\n\n> La lumière marque l\'action.'}
      .resolveLink=${(href: string) =>
        href.startsWith('http') ? { kind: 'external', href } : href === 'T104.md' ? { kind: 'internal', href: '#T104' } : { kind: 'unresolved', title: href }}
    ></lu-markdown>`,
}
