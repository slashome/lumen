import { act, type ComponentProps, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import type { LumenDialog } from '../components/dialog/dialog'
import type { LumenSegmented } from '../components/segmented/segmented'
import type { LumenTooltip } from '../components/tooltip/tooltip'
import * as react from './index'
import { buttonClasses, LuButton, LuCombobox, LuConfirmDialog, LuDialog, LuHighlight, LuMultiSelect, LuSegmented, LuSelect, LuSheet, LuTabs, LuTag, LuTooltip } from './index'
import { ComboboxElement, ConfirmDialogElement, FileDropElement, HighlightElement, MultiSelectElement, SegmentedElement, SelectElement, TabsElement } from './elements'

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
  it('names every component Lu<Name>, as the Vue adapter does', () => {
    const components = Object.keys(react).filter((name) => /^[A-Z]/.test(name))
    expect(components.length).toBeGreaterThan(0)
    expect(components.filter((name) => !name.startsWith('Lu'))).toEqual([])
  })

  it('requires the label that names a select, a multi-select, a segmented, tabs, a file drop or a combobox, as the elements do', () => {
    expectTypeOf<ComponentProps<typeof ComboboxElement>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof LuCombobox>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof SelectElement>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof MultiSelectElement>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof SegmentedElement>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof TabsElement>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof FileDropElement>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof LuSelect>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof LuMultiSelect>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof LuSegmented>['label']>().toEqualTypeOf<string>()
    expectTypeOf<ComponentProps<typeof LuTabs>['label']>().toEqualTypeOf<string>()
  })

  it('leaves confirmLabel optional, over the confirm message', () => {
    expectTypeOf<ComponentProps<typeof LuConfirmDialog>['confirmLabel']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<ComponentProps<typeof ConfirmDialogElement>['confirmLabel']>().toEqualTypeOf<string | undefined>()
  })

  it('passes properties to the wrapped element', async () => {
    const host = await mount(<HighlightElement text="Raw wrapper" />)
    expect(host.textContent).toContain('Raw wrapper')
  })

  it('passes properties through the adapter component', async () => {
    const host = await mount(<LuHighlight text="Paint the fence" />)
    expect(host.textContent).toContain('Paint the fence')
  })

  it('draws a tag as the CSS class without onRemove, and as the removable element with it', async () => {
    const onRemove = vi.fn()
    const host = await mount(
      <>
        <LuTag>Design</LuTag>
        <LuTag value="a11y" onRemove={onRemove}>
          Accessibility
        </LuTag>
      </>,
    )
    expect(host.querySelector('span.lu-tag')?.textContent).toBe('Design')
    const tag = host.querySelector<HTMLElement & { updateComplete: Promise<boolean> }>('lu-tag')!
    await tag.updateComplete
    expect(tag.hasAttribute('removable')).toBe(true)
    tag.shadowRoot!.querySelector<HTMLButtonElement>('[part="remove"]')!.click()
    expect(onRemove).toHaveBeenCalledWith('a11y')
  })

  it('keeps a combobox given value where React puts it, and reports the choice and the search', async () => {
    const onValueChange = vi.fn()
    const onSearch = vi.fn()
    const host = await mount(<LuCombobox label="Fruit" options={[{ value: 'apple', label: 'Apple' }]} value="" onValueChange={onValueChange} onSearch={onSearch} />)
    const combobox = host.querySelector<HTMLElement & { updateComplete: Promise<boolean>; value: unknown }>('lu-combobox')!
    await combobox.updateComplete
    const input = combobox.shadowRoot!.querySelector('input')!
    input.value = 'app'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await combobox.updateComplete
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await combobox.updateComplete
    expect(onSearch).toHaveBeenCalledWith('app')
    expect(onValueChange).toHaveBeenCalledWith('apple', 'option')
    expect(combobox.value).toBe('')
  })

  it('draws a button of type button by default, and a link styled as one given href', async () => {
    const host = await mount(
      <>
        <LuButton variant="outline">Save</LuButton>
        <LuButton href="/docs" size="sm">
          Docs
        </LuButton>
      </>,
    )
    const button = host.querySelector('button')!
    expect(button.type).toBe('button')
    expect(button.className).toBe('lu-button lu-button--outline')
    const link = host.querySelector('a')!
    expect(link.getAttribute('href')).toBe('/docs')
    expect(link.hasAttribute('type')).toBe(false)
    expect(link.className).toBe('lu-button lu-button--sm')
  })

  it('marks a loading button busy and blocks its activation, keeping it focusable', async () => {
    const onClick = vi.fn()
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    const host = await mount(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <LuButton type="submit" loading onClick={onClick}>
          Save
        </LuButton>
        <LuButton href="/docs" loading onClick={onClick}>
          Docs
        </LuButton>
      </form>,
    )
    const button = host.querySelector('button')!
    const link = host.querySelector('a')!
    for (const element of [button, link]) {
      expect(element.getAttribute('aria-busy')).toBe('true')
      expect(element.getAttribute('aria-disabled')).toBe('true')
      expect(element.hasAttribute('disabled')).toBe(false)
      const click = new MouseEvent('click', { bubbles: true, cancelable: true })
      element.dispatchEvent(click)
      expect(click.defaultPrevented).toBe(true)
    }
    button.focus()
    expect(document.activeElement).toBe(button)
    expect(onClick).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onClick of a button that is not loading', async () => {
    const onClick = vi.fn()
    const host = await mount(<LuButton onClick={onClick}>Save</LuButton>)
    host.querySelector('button')!.click()
    expect(onClick).toHaveBeenCalledOnce()
    expect(host.querySelector('button')!.hasAttribute('aria-busy')).toBe(false)
  })

  it('draws the danger button, also under its deprecated name', () => {
    expect(buttonClasses({ variant: 'danger' })).toBe('lu-button lu-button--danger')
    expect(buttonClasses({ variant: 'destructive' })).toBe('lu-button lu-button--danger')
  })

  it('keeps a dialog given open where React puts it, and reports the request', async () => {
    const onOpenChange = vi.fn()
    const host = await mount(<LuDialog open title="Edit" onOpenChange={onOpenChange} />)
    const dialog = host.querySelector<LumenDialog>('lu-dialog')!
    dialog.shadowRoot!.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
    await dialog.updateComplete
    expect(onOpenChange).toHaveBeenCalledWith(false, 'escape')
    expect(dialog.open).toBe(true)
  })

  it('docks a sheet to the bottom with placement', async () => {
    const host = await mount(<LuSheet placement="bottom" title="Plank" />)
    const sheet = host.querySelector('lu-sheet')!
    await (sheet as LumenDialog).updateComplete
    expect(sheet.getAttribute('placement')).toBe('bottom')
  })

  it('lets a dialog without open close itself, and reports it', async () => {
    const onOpenChange = vi.fn()
    const host = await mount(<LuDialog title="Edit" onOpenChange={onOpenChange} />)
    const dialog = host.querySelector<LumenDialog>('lu-dialog')!
    dialog.open = true
    await dialog.updateComplete
    dialog.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click()
    await dialog.updateComplete
    expect(onOpenChange).toHaveBeenCalledWith(false, 'close-button')
    expect(dialog.open).toBe(false)
  })

  it('binds a tooltip to its trigger by htmlFor, controls it given open, and leaves one without it alone', async () => {
    const host = await mount(
      <>
        <button id="one">One</button>
        <LuTooltip htmlFor="one" open={false}>
          Controlled
        </LuTooltip>
        <button id="two">Two</button>
        <LuTooltip htmlFor="two">Free</LuTooltip>
      </>,
    )
    const [controlled, free] = [...host.querySelectorAll<LumenTooltip>('lu-tooltip')]
    const [one, two] = [...host.querySelectorAll('button')]
    expect(one!.getAttribute('aria-describedby')).toBe(controlled!.id)
    expect(two!.getAttribute('aria-describedby')).toBe(free!.id)
    for (const [tooltip, trigger] of [
      [controlled!, one!],
      [free!, two!],
    ] as const) {
      tooltip.delay = 0
      trigger.dispatchEvent(new Event('pointerenter'))
    }
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(controlled!.open).toBe(false)
    expect(free!.open).toBe(true)
  })

  it('keeps a segmented given a value on that value until React changes it', async () => {
    const onChange = vi.fn()
    const host = await mount(<LuSegmented label="Size" values={['S', 'M']} value="S" onChange={onChange} />)
    const segmented = host.querySelector<LumenSegmented>('lu-segmented')!
    segmented.shadowRoot!.querySelectorAll('button')[1]!.click()
    await segmented.updateComplete
    expect(onChange).toHaveBeenCalledWith('M', 'option')
    expect(segmented.value).toBe('S')
  })

  it('lets a segmented without a value change itself', async () => {
    const onChange = vi.fn()
    const host = await mount(<LuSegmented label="Size" values={['S', 'M']} onChange={onChange} />)
    const segmented = host.querySelector<LumenSegmented>('lu-segmented')!
    segmented.shadowRoot!.querySelectorAll('button')[1]!.click()
    await segmented.updateComplete
    expect(onChange).toHaveBeenCalledWith('M', 'option')
    expect(segmented.value).toBe('M')
  })

  it('leaves the segmented buttons out of the tab order with skipTab, or the deprecated focusable false', async () => {
    const host = await mount(
      <>
        <LuSegmented label="Kept" values={['S']} />
        <LuSegmented label="Skipped" values={['S']} skipTab />
        <LuSegmented label="Unfocusable" values={['S']} focusable={false} />
      </>,
    )
    const segmenteds = [...host.querySelectorAll<LumenSegmented>('lu-segmented')]
    await Promise.all(segmenteds.map((segmented) => segmented.updateComplete))
    expect(segmenteds.map((segmented) => segmented.shadowRoot!.querySelector('button')!.tabIndex)).toEqual([0, -1, -1])
  })
})
