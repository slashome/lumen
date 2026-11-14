import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, type GlobalComponents } from 'vue'
import type { LumenDialog } from '../components/dialog/dialog'
import type { LumenSegmented } from '../components/segmented/segmented'
import type { LumenTooltip } from '../components/tooltip/tooltip'
import '../components/dialog/dialog'
import '../components/tooltip/tooltip'
import '../components/segmented/segmented'
import type { LumenCombobox } from '../components/combobox/combobox'
import '../components/combobox/combobox'
import { lumen, LuButton, LuCombobox, LuDialog, LuMultiSelect, LuSegmented, LuSelect, LuTabs, LuTooltip } from './index'
import './elements'

afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('style')
})

async function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div')
  document.body.append(host)
  createApp(defineComponent({ setup: () => render })).mount(host)
  await nextTick()
  return host
}

function pressEscape(dialog: LumenDialog) {
  dialog.shadowRoot!.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
}

type PropsOf<Component> = Component extends new () => { $props: infer Props } ? Props : never

describe('the Vue adapter', () => {
  it('requires the label that names a select, a multi-select, a segmented, tabs, a file drop or a combobox, on the tags and on the components', () => {
    expectTypeOf<PropsOf<GlobalComponents['lu-combobox']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<typeof LuCombobox>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-select']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-multi-select']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-segmented']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-tabs']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-file-drop']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-confirm-dialog']>['confirmLabel']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<PropsOf<typeof LuSelect>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<typeof LuMultiSelect>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<typeof LuSegmented>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<typeof LuTabs>['label']>().toEqualTypeOf<string>()
  })

  it('sets the theme given to the plugin', () => {
    createApp(defineComponent({ render: () => null })).use(lumen, { messages: {}, theme: { primary: '#16a34a', secondary: '#c026d3' } })
    expect(document.documentElement.style.getPropertyValue('--lu-theme-primary')).toBe('#16a34a')
    expect(document.documentElement.style.getPropertyValue('--lu-theme-secondary')).toBe('#c026d3')
  })

  it('draws a button of type button by default, and a link styled as one given href', async () => {
    const host = await mount(() => h('div', [h(LuButton, { variant: 'outline' }, () => 'Save'), h(LuButton, { href: '/docs', size: 'sm' }, () => 'Docs')]))
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
    const onSubmit = vi.fn((event: Event) => event.preventDefault())
    const host = await mount(() =>
      h('form', { onSubmit }, [h(LuButton, { type: 'submit', loading: true, onClick }, () => 'Save'), h(LuButton, { href: '/docs', loading: true, onClick }, () => 'Docs')]),
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

  it('emits click from a button that is not loading, and keeps the classes given', async () => {
    const onClick = vi.fn()
    const host = await mount(() => h(LuButton, { class: 'wide', onClick }, () => 'Save'))
    const button = host.querySelector('button')!
    button.click()
    expect(onClick).toHaveBeenCalledOnce()
    expect(button.className).toBe('lu-button wide')
    expect(button.hasAttribute('aria-busy')).toBe(false)
  })

  it('drives a dialog through v-model:open', async () => {
    const open = ref(true)
    const host = await mount(() => h(LuDialog, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value), heading: 'Edit' }))
    const dialog = host.querySelector<LumenDialog>('lu-dialog')!
    await dialog.updateComplete
    expect(dialog.open).toBe(true)
    pressEscape(dialog)
    await nextTick()
    await dialog.updateComplete
    expect(open.value).toBe(false)
    expect(dialog.open).toBe(false)
  })

  it('keeps a dialog bound to open where the owner puts it', async () => {
    const host = await mount(() => h(LuDialog, { open: true, heading: 'Edit' }))
    const dialog = host.querySelector<LumenDialog>('lu-dialog')!
    await dialog.updateComplete
    pressEscape(dialog)
    await dialog.updateComplete
    expect(dialog.open).toBe(true)
  })

  it('lets a dialog without open close itself, and still emits update:open', async () => {
    const updates: boolean[] = []
    const host = await mount(() => h(LuDialog, { 'onUpdate:open': (value: boolean) => updates.push(value), heading: 'Edit' }))
    const dialog = host.querySelector<LumenDialog>('lu-dialog')!
    dialog.open = true
    await dialog.updateComplete
    pressEscape(dialog)
    await dialog.updateComplete
    expect(updates).toEqual([false])
    expect(dialog.open).toBe(false)
  })

  it('drives a segmented through v-model:value', async () => {
    const value = ref<string | null>('S')
    const host = await mount(() => h(LuSegmented, { label: 'Size', values: ['S', 'M'], value: value.value, 'onUpdate:value': (next: string | null) => (value.value = next) }))
    const segmented = host.querySelector<LumenSegmented>('lu-segmented')!
    await segmented.updateComplete
    segmented.shadowRoot!.querySelectorAll('button')[1]!.click()
    await nextTick()
    await segmented.updateComplete
    expect(value.value).toBe('M')
    expect(segmented.value).toBe('M')
  })

  it('drives a multiple combobox through v-model:value', async () => {
    const value = ref<string | string[] | undefined>(['apple'])
    const options = [
      { value: 'apple', label: 'Apple' },
      { value: 'kiwi', label: 'Kiwi' },
    ]
    const host = await mount(() => h(LuCombobox, { label: 'Fruits', multiple: true, options, value: value.value, 'onUpdate:value': (next: string | string[] | undefined) => (value.value = next) }))
    const combobox = host.querySelector<LumenCombobox>('lu-combobox')!
    await combobox.updateComplete
    const input = combobox.shadowRoot!.querySelector('input')!
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
    await nextTick()
    await combobox.updateComplete
    expect(value.value).toEqual([])
    expect(combobox.value).toEqual([])
  })

  it('binds a tooltip to its trigger by the for attribute, or by an element given to anchor', async () => {
    const anchor = ref<Element | null>(null)
    const host = await mount(() =>
      h('div', [
        h('button', { id: 'copy' }, 'Copy'),
        h(LuTooltip, { for: 'copy' }, () => 'Copy the command'),
        h('button', { ref: anchor }, 'Paste'),
        h(LuTooltip, { anchor: anchor.value }, () => 'Paste the command'),
      ]),
    )
    await nextTick()
    const [byId, byAnchor] = [...host.querySelectorAll<LumenTooltip>('lu-tooltip')]
    await Promise.all([byId!.updateComplete, byAnchor!.updateComplete])
    const [copy, paste] = [...host.querySelectorAll('button')]
    expect(copy!.getAttribute('aria-describedby')).toBe(byId!.id)
    expect(paste!.getAttribute('aria-describedby')).toBe(byAnchor!.id)
  })
})
