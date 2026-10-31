import { afterEach, describe, expect, it } from 'vitest'
import { highlightTerms } from '../../lib/highlight-terms'
import { mount } from '../../testing/mount'
import type { LumenHighlight } from './highlight'
import './highlight'

afterEach(() => {
  document.body.innerHTML = ''
  highlightTerms.set([])
})

describe('lu-highlight', () => {
  it('marks the shared terms, case and accents ignored', async () => {
    highlightTerms.set(['ete'])
    const highlight = await mount<LumenHighlight>('<lu-highlight text="Un Été chaud"></lu-highlight>')
    expect([...highlight.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual(['Été'])
  })
})
