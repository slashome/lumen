import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, nothing } from 'lit'
import { expect } from 'storybook/test'
import motion from '../tokens/semantic/base/motion.json'
import theme from '../tokens/semantic/base/theme.json'
import semanticColors from '../tokens/semantic/light/color.json'
import { contrast, inlineStyle, opaque, tokenRules, type Declarations } from './token-fallback'
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

const defaultTheme: Declarations = [
  ['--lu-theme-primary', theme.theme.primary.$value],
  ['--lu-theme-secondary', theme.theme.secondary.$value],
]

function panels() {
  const rules = tokenRules()
  return [
    { mode: 'light', modern: [...defaultTheme, ...rules.light], fallback: [...defaultTheme, ...rules.light, ...rules.lightFallback], pinned: rules.lightFallback },
    {
      mode: 'dark',
      modern: [...defaultTheme, ...rules.light, ...rules.dark],
      fallback: [...defaultTheme, ...rules.light, ...rules.lightFallback, ...rules.dark, ...rules.darkFallback],
      pinned: rules.darkFallback,
    },
  ]
}

function panel(mode: string, kind: string, declarations: Declarations, pinned: Declarations) {
  return html`
    <section
      data-mode=${mode}
      data-kind=${kind}
      style="${inlineStyle(declarations)}; padding:1rem; border-radius:var(--lu-radius-md); background:var(--lu-color-background); color:var(--lu-color-foreground)"
    >
      <h3 style="margin:0 0 0.75rem;font-size:var(--lu-font-size-sm)">${mode}, ${kind}</h3>
      <p style="display:flex;gap:0.75rem;align-items:center;margin:0 0 0.75rem">
        <button class="lu-button" type="button">Save</button>
        <span>A <mark class="lu-mark">matched</mark> term</span>
      </p>
      <div style="display:flex;gap:0.5rem">
        ${pinned.map(
          ([name]) => html`<span data-token=${name} title=${name} style="inline-size:2rem;block-size:2rem;border-radius:var(--lu-radius-sm);background:var(${name})"></span>`,
        )}
      </div>
    </section>
  `
}

function section(canvasElement: HTMLElement, mode: string, kind: string): HTMLElement {
  const found = canvasElement.querySelector<HTMLElement>(`section[data-mode=${mode}][data-kind=${kind}]`)
  if (!found) throw new Error(`No ${mode} ${kind} panel`)
  return found
}

function computed(element: Element, property: string): string {
  return getComputedStyle(element).getPropertyValue(property).trim()
}

export const RelativeColorFallback: StoryObj = {
  name: 'Relative color fallback',
  parameters: {
    docs: {
      description: {
        story:
          'Some colors derive from the theme with relative color syntax, `oklch(from …)`, which is not yet Baseline widely available. `tokens.css` repeats them under `@supports not (color: oklch(from red l c h))` with values computed at build time from the default theme, so an older browser draws them with the default colors. Each mode shows the derived colors as a current browser computes them, then the fallback an older browser gets.',
      },
    },
  },
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:1rem">
      ${panels().flatMap(({ mode, modern, fallback, pinned }) => [panel(mode, 'relative', modern, pinned), panel(mode, 'fallback', fallback, pinned)])}
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    for (const { mode, pinned } of panels()) {
      await step(`${mode}: the fallback replaces every relative color`, async () => {
        expect(pinned.length).toBeGreaterThan(0)
        const fallback = section(canvasElement, mode, 'fallback')
        for (const name of Array.from(getComputedStyle(fallback)).filter((property) => property.startsWith('--lu-color-'))) {
          expect(computed(fallback, name), name).not.toContain('from')
        }
      })

      await step(`${mode}: the fallback matches what relative colors compute with the default theme`, async () => {
        const relative = section(canvasElement, mode, 'relative')
        const fallback = section(canvasElement, mode, 'fallback')
        const background = computed(relative, 'background-color')
        for (const [name] of pinned) {
          const expected = opaque(computed(relative.querySelector(`[data-token="${name}"]`)!, 'background-color'), background)
          const actual = opaque(computed(fallback.querySelector(`[data-token="${name}"]`)!, 'background-color'), background)
          actual.forEach((channel, index) => expect(Math.abs(channel - (expected[index] ?? 0)), name).toBeLessThanOrEqual(2))
        }
      })

      await step(`${mode}: the fallback stays readable`, async () => {
        const fallback = section(canvasElement, mode, 'fallback')
        const page = opaque(computed(fallback, 'background-color'), '#fff')
        const button = fallback.querySelector('.lu-button')!
        const fill = opaque(computed(button, 'background-color'), `rgb(${page.join(' ')})`)
        expect(contrast(opaque(computed(button, 'color'), `rgb(${fill.join(' ')})`), fill)).toBeGreaterThanOrEqual(4.5)
        const mark = fallback.querySelector('.lu-mark')!
        const highlight = opaque(computed(mark, 'background-color'), `rgb(${page.join(' ')})`)
        expect(contrast(opaque(computed(mark, 'color'), `rgb(${page.join(' ')})`), highlight)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(opaque(computed(fallback, '--lu-color-ring'), `rgb(${page.join(' ')})`), page)).toBeGreaterThanOrEqual(3)
      })
    }
  },
}
