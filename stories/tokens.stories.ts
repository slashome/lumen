import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, nothing } from 'lit'
import motion from '../tokens/semantic/base/motion.json'
import theme from '../tokens/semantic/base/theme.json'
import semanticColors from '../tokens/semantic/light/color.json'
import { tokensOf, type Token } from './token-list'

const colors = tokensOf(semanticColors)
const others = [...tokensOf(theme), ...tokensOf(motion)]

function deprecation({ deprecated }: Token) {
  return deprecated === null ? nothing : html`<span class="lu-badge lu-badge--outline">Deprecated</span> ${deprecated}`
}

const meta: Meta = {
  title: 'Foundations/Tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The semantic tokens, read from the JSON in `tokens/semantic`. A token marked `$deprecated` shows a Deprecated badge with its replacement; it lives at least one minor version before it is removed in a major.',
      },
    },
  },
}
export default meta

export const Colors: StoryObj = {
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(16rem,1fr));gap:1.5rem;font-size:0.8rem">
      ${colors.map(
        (token) => html`
          <figure style="margin:0">
            <div style="block-size:3rem;border:1px solid var(--lu-color-border);border-radius:var(--lu-radius-md);background:var(${token.variable})"></div>
            <figcaption>
              <code>${token.variable}</code> ${deprecation(token)}
              <p style="margin:0.25rem 0 0;color:var(--lu-color-muted-foreground)">${token.description}</p>
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
          (token) => html`
            <tr><td><code>${token.variable}</code> ${deprecation(token)}</td><td><code>${token.value}</code></td><td>${token.description}</td></tr>
          `,
        )}
      </tbody>
    </table>
  `,
}
