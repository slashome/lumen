import { describe, expect, it } from 'vitest'
import { tokensOf } from './token-list'

describe('tokensOf', () => {
  it('reads $deprecated, with or without a reason', () => {
    const tokens = tokensOf({
      color: {
        $type: 'color',
        quiet: { $value: '#777', $description: 'Secondary text.' },
        faint: { $value: '#777', $description: 'Formerly.', $deprecated: 'Use color.quiet.' },
        dim: { $value: '#777', $description: 'Dimmed.', $deprecated: true },
        kept: { $value: '#777', $description: 'Kept.', $deprecated: false },
      },
    })
    expect(tokens.map(({ variable, deprecated }) => [variable, deprecated])).toEqual([
      ['--lu-color-quiet', null],
      ['--lu-color-faint', 'Use color.quiet.'],
      ['--lu-color-dim', ''],
      ['--lu-color-kept', null],
    ])
  })
})
