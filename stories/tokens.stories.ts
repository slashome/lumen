import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import motion from '../tokens/semantic/base/motion.json'
import theme from '../tokens/semantic/base/theme.json'
import semanticColors from '../tokens/semantic/light/color.json'

type Token = { variable: string; value: string; description: string }

function isGroup(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null
}

function tokensOf(group: Record<string, unknown>, path: string[] = []): Token[] {
  return Object.entries(group).flatMap(([key, node]) => {
    if (key.startsWith('$') || !isGroup(node)) return []
    const nodePath = [...path, key]
    if (!('$value' in node)) return tokensOf(node, nodePath)
    return [{ variable: `--lu-${nodePath.join('-')}`, value: String(node.$value), description: String(node.$description ?? '') }]
  })
}

const colors = tokensOf(semanticColors)
const others = [...tokensOf(theme), ...tokensOf(motion)]

const meta: Meta = { title: 'Foundations/Tokens' }
export default meta

export const Colors: StoryObj = {
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(16rem,1fr));gap:1.5rem;font-size:0.8rem">
      ${colors.map(
        ({ variable, description }) => html`
          <figure style="margin:0">
            <div style="block-size:3rem;border:1px solid var(--lu-color-border);border-radius:var(--lu-radius-md);background:var(${variable})"></div>
            <figcaption>
              <code>${variable}</code>
              <p style="margin:0.25rem 0 0;color:var(--lu-color-muted-foreground)">${description}</p>
            </figcaption>
          </figure>
        `,
      )}
    </div>
  `,
}

export const ThemeMotionAndControls: StoryObj = {
  name: 'Theme, motion and controls',
  render: () => html`
    <table class="lu-data-table">
      <thead>
        <tr><th scope="col">Token</th><th scope="col">Default</th><th scope="col">Use</th></tr>
      </thead>
      <tbody>
        ${others.map(
          ({ variable, value, description }) => html`
            <tr><td><code>${variable}</code></td><td><code>${value}</code></td><td>${description}</td></tr>
          `,
        )}
      </tbody>
    </table>
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
