import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { light } from '../src/lib/light'

const meta: Meta = {
  title: 'Foundations/Light',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `The light marks the action, the color marks the state. Every action lights up for a moment, then gets its color back; the state is read from the color, never from the light.

\`attachLight()\` from \`@slashome/lumen/lib\` lights \`.lu-button\`, \`.lu-icon-button\`, \`.lu-switch\`, \`.lu-checkbox\`, \`.lu-radio\` and any \`[data-lu-light]\` element on click; \`light(element)\` lights one by hand. The glow takes \`--lu-light-color\`, and its duration, curve and intensity come from the \`motion.light\` tokens. It is off under \`prefers-reduced-motion\`.`,
      },
    },
  },
}
export default meta

function lightUp(event: Event) {
  light(event.currentTarget as Element)
}

export const Default: StoryObj = {
  render: () => html`
    <div style="display:flex;gap:0.75rem;align-items:center">
      <button class="lu-button" @click=${lightUp}>Click me</button>
      <input type="checkbox" role="switch" class="lu-switch" aria-label="Sub-nodes" @click=${lightUp} />
    </div>
  `,
}
