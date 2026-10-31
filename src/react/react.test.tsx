import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { buttonClasses, Highlight } from './index'
import { HighlightElement } from './elements'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

async function mount(node: ReactNode): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  await act(async () => createRoot(host).render(node))
  await new Promise((resolve) => setTimeout(resolve, 0))
  return host
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('the React adapter', () => {
  it('passes properties to the wrapped element', async () => {
    const host = await mount(<HighlightElement text="Raw wrapper" />)
    expect(host.textContent).toContain('Raw wrapper')
  })

  it('passes properties through the adapter component', async () => {
    const host = await mount(<Highlight text="Paint the fence" />)
    expect(host.textContent).toContain('Paint the fence')
  })

  it('draws the danger button, also under its deprecated name', () => {
    expect(buttonClasses({ variant: 'danger' })).toBe('lu-button lu-button--danger')
    expect(buttonClasses({ variant: 'destructive' })).toBe('lu-button lu-button--danger')
  })
})
