import { beforeEach, describe, expect, it } from 'vitest'
import { dismiss, toast, toasts } from './toast'

describe('toast', () => {
  beforeEach(() => toasts.set([]))

  it('queues a message with its kind and a default duration', () => {
    toast.success('Saved')
    toast.danger('Failed', { duration: 10 })
    expect(toasts.get().map(({ kind, message, duration }) => ({ kind, message, duration }))).toEqual([
      { kind: 'success', message: 'Saved', duration: 4000 },
      { kind: 'danger', message: 'Failed', duration: 10 },
    ])
  })

  it('raises a danger toast from the deprecated toast.error', () => {
    toast.error('Failed')
    expect(toasts.get().map((entry) => entry.kind)).toEqual(['danger'])
  })

  it('removes a dismissed message only', () => {
    const first = toast('One')
    toast.info('Two')
    dismiss(first)
    expect(toasts.get().map((entry) => entry.message)).toEqual(['Two'])
  })
})
