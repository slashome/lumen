import { afterEach, describe, expect, expectTypeOf, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, type GlobalComponents } from 'vue'
import type { LumenDialog } from '../components/dialog/dialog'
import type { LumenSegmented } from '../components/segmented/segmented'
import type { LumenTooltip } from '../components/tooltip/tooltip'
import '../components/dialog/dialog'
import '../components/tooltip/tooltip'
import '../components/segmented/segmented'
import { LuDialog, LuMultiSelect, LuSegmented, LuSelect, LuTabs, LuTooltip } from './index'
import './elements'

afterEach(() => {
  document.body.innerHTML = ''
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
  it('requires the label that names a select, a multi-select, a segmented or tabs, on the tags and on the components', () => {
    expectTypeOf<PropsOf<GlobalComponents['lu-select']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-multi-select']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-segmented']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-tabs']>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<GlobalComponents['lu-confirm-dialog']>['confirmLabel']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<PropsOf<typeof LuSelect>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<typeof LuMultiSelect>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<typeof LuSegmented>['label']>().toEqualTypeOf<string>()
    expectTypeOf<PropsOf<typeof LuTabs>['label']>().toEqualTypeOf<string>()
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
