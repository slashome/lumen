import { beforeEach, describe, expect, it, vi } from 'vitest'
import { storedSort } from './sort-store'

describe('storedSort', () => {
  beforeEach(() => localStorage.clear())

  it('keeps the sort under its key and tells the subscribers of that key', () => {
    const tasks = storedSort('app.sort.tasks')
    const listener = vi.fn()
    tasks.subscribe(listener)
    tasks.set({ column: 'title', direction: 'desc' })
    expect(storedSort('app.sort.tasks').get()).toEqual({ column: 'title', direction: 'desc' })
    expect(storedSort('app.sort.other').get()).toBeNull()
    expect(listener).toHaveBeenCalledWith({ column: 'title', direction: 'desc' })
  })

  it('forgets the sort when it is cleared', () => {
    const tasks = storedSort('app.sort.tasks')
    tasks.set({ column: 'title', direction: 'asc' })
    tasks.set(null)
    expect(tasks.get()).toBeNull()
  })
})
