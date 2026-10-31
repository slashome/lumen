import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LumenDialog } from '../components/dialog/dialog'
import type { LumenSegmented } from '../components/segmented/segmented'
import type { LumenTooltip } from '../components/tooltip/tooltip'
import { buttonClasses, Dialog, Highlight, Segmented, Tooltip } from './index'
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

  it('keeps a dialog given open where React puts it, and reports the request', async () => {
    const onOpenChange = vi.fn()
    const host = await mount(<Dialog open title="Edit" onOpenChange={onOpenChange} />)
    const dialog = host.querySelector<LumenDialog>('lu-dialog')!
    dialog.shadowRoot!.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
    await dialog.updateComplete
    expect(onOpenChange).toHaveBeenCalledWith(false, 'escape')
    expect(dialog.open).toBe(true)
  })

  it('lets a dialog without open close itself, and reports it', async () => {
    const onOpenChange = vi.fn()
    const host = await mount(<Dialog title="Edit" onOpenChange={onOpenChange} />)
    const dialog = host.querySelector<LumenDialog>('lu-dialog')!
    dialog.open = true
    await dialog.updateComplete
    dialog.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click()
    await dialog.updateComplete
    expect(onOpenChange).toHaveBeenCalledWith(false, 'close-button')
    expect(dialog.open).toBe(false)
  })

  it('controls a tooltip given open, and leaves one without it alone', async () => {
    const host = await mount(
      <>
        <Tooltip content="Controlled" open={false}>
          <button>One</button>
        </Tooltip>
        <Tooltip content="Free">
          <button>Two</button>
        </Tooltip>
      </>,
    )
    const [controlled, free] = [...host.querySelectorAll<LumenTooltip>('lu-tooltip')]
    for (const tooltip of [controlled!, free!]) {
      tooltip.delay = 0
      tooltip.dispatchEvent(new Event('pointerenter'))
    }
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(controlled!.open).toBe(false)
    expect(free!.open).toBe(true)
  })

  it('keeps a segmented given a value on that value until React changes it', async () => {
    const onChange = vi.fn()
    const host = await mount(<Segmented label="Size" values={['S', 'M']} value="S" onChange={onChange} />)
    const segmented = host.querySelector<LumenSegmented>('lu-segmented')!
    segmented.shadowRoot!.querySelectorAll('button')[1]!.click()
    await segmented.updateComplete
    expect(onChange).toHaveBeenCalledWith('M', 'option')
    expect(segmented.value).toBe('S')
  })

  it('lets a segmented without a value change itself', async () => {
    const onChange = vi.fn()
    const host = await mount(<Segmented label="Size" values={['S', 'M']} onChange={onChange} />)
    const segmented = host.querySelector<LumenSegmented>('lu-segmented')!
    segmented.shadowRoot!.querySelectorAll('button')[1]!.click()
    await segmented.updateComplete
    expect(onChange).toHaveBeenCalledWith('M', 'option')
    expect(segmented.value).toBe('M')
  })

  it('leaves the segmented buttons out of the tab order with skipTab, or the deprecated focusable false', async () => {
    const host = await mount(
      <>
        <Segmented label="Kept" values={['S']} />
        <Segmented label="Skipped" values={['S']} skipTab />
        <Segmented label="Unfocusable" values={['S']} focusable={false} />
      </>,
    )
    const segmenteds = [...host.querySelectorAll<LumenSegmented>('lu-segmented')]
    await Promise.all(segmenteds.map((segmented) => segmented.updateComplete))
    expect(segmenteds.map((segmented) => segmented.shadowRoot!.querySelector('button')!.tabIndex)).toEqual([0, -1, -1])
  })
})
