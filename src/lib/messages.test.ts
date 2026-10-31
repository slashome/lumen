import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { en, fr } from '../../stories/messages'
import { mount } from '../testing/mount'
import type { LumenConfirmDialog } from '../components/confirm-dialog/confirm-dialog'
import type { LumenDialog } from '../components/dialog/dialog'
import { lumenMessageKeys, messagesFor, registerLumenMessages, type LumenMessages } from './messages'
import '../components/confirm-dialog/confirm-dialog'
import '../components/dialog/dialog'

const registryKey = Symbol.for('@slashome/lumen/messages')

function resetRegistry() {
  delete (globalThis as unknown as Record<symbol, unknown>)[registryKey]
}

function closeName(dialog: LumenDialog): string | null {
  return dialog.shadowRoot!.querySelector('.close')!.getAttribute('aria-label')
}

async function settle(element: LumenDialog) {
  await new Promise((resolve) => setTimeout(resolve))
  await element.updateComplete
}

beforeEach(() => {
  resetRegistry()
  document.documentElement.lang = 'en'
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('LumenMessages', () => {
  it('lists every key of the type in lumenMessageKeys', () => {
    expectTypeOf<(typeof lumenMessageKeys)[number]>().toEqualTypeOf<keyof LumenMessages>()
    expect([...lumenMessageKeys].sort()).toEqual(Object.keys(en).sort())
  })
})

describe('registerLumenMessages', () => {
  it('resolves the language of the element, else of the document, and falls back from fr-CA to fr', async () => {
    registerLumenMessages('en', en)
    registerLumenMessages('fr', fr)
    document.documentElement.lang = 'fr-CA'
    const dialog = await mount<LumenDialog>('<lu-dialog heading="Edit"></lu-dialog>')
    expect(closeName(dialog)).toBe('Fermer')

    const english = await mount<LumenDialog>('<lu-dialog heading="Edit" lang="en"></lu-dialog>')
    expect(closeName(english)).toBe('Close')
  })

  it('lets the attribute of an instance win over the registry', async () => {
    registerLumenMessages('en', en)
    const dialog = await mount<LumenDialog>('<lu-dialog heading="Edit" close-label="Dismiss"></lu-dialog>')
    expect(closeName(dialog)).toBe('Dismiss')
  })

  it('updates the elements on the page when the language changes or messages are registered', async () => {
    registerLumenMessages('en', en)
    registerLumenMessages('fr', fr)
    const dialog = await mount<LumenDialog>('<lu-dialog heading="Edit"></lu-dialog>')
    expect(closeName(dialog)).toBe('Close')

    document.documentElement.lang = 'fr'
    await settle(dialog)
    expect(closeName(dialog)).toBe('Fermer')

    registerLumenMessages('fr', { ...fr, close: 'Quitter' })
    await dialog.updateComplete
    expect(closeName(dialog)).toBe('Quitter')
  })

  it('reports a missing label in the console and renders nothing in its place', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    document.documentElement.lang = 'de'
    const dialog = await mount<LumenDialog>('<lu-dialog heading="Edit"></lu-dialog>')
    expect(closeName(dialog)).toBeNull()
    expect(error).toHaveBeenCalledWith(expect.stringContaining('<lu-dialog> has no label for "close" in language "de"'))
    expect(error).toHaveBeenCalledWith(expect.stringContaining('close-label'))
  })

  it('names the confirm button from the confirm message, unless confirm-label is set', async () => {
    registerLumenMessages('en', en)
    const generic = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" open></lu-confirm-dialog>')
    const [cancel, confirm] = generic.shadowRoot!.querySelectorAll('.actions button')
    expect(cancel?.textContent?.trim()).toBe('Cancel')
    expect(confirm?.textContent?.trim()).toBe('Confirm')

    const specific = await mount<LumenConfirmDialog>('<lu-confirm-dialog heading="Delete T104?" confirm-label="Delete" open></lu-confirm-dialog>')
    expect(specific.shadowRoot!.querySelectorAll('.actions button')[1]?.textContent?.trim()).toBe('Delete')
  })

  it('shares one registry between two copies of Lumen', async () => {
    vi.resetModules()
    const first = await import('./messages')
    vi.resetModules()
    const second = await import('./messages')
    expect(first.registerLumenMessages).not.toBe(second.registerLumenMessages)

    first.registerLumenMessages('fr', fr)
    expect(second.messagesFor('fr')?.close).toBe('Fermer')
    expect(messagesFor('fr-CA')?.close).toBe('Fermer')
  })
})
