import { describe, expect, it } from 'vitest'
import { changelogSection } from './changelog-section.js'

const changelog = `# @slashome/lumen

## 0.2.0

### Minor Changes

- abc1234: Add lu-tabs.

## 0.1.10

### Patch Changes

- def5678: Fix the dialog focus.

## 0.1.1

- An older line.
`

describe('changelogSection', () => {
  it('returns the body of the section of a version, without its heading', () => {
    expect(changelogSection(changelog, '0.2.0')).toBe('### Minor Changes\n\n- abc1234: Add lu-tabs.')
  })

  it('stops at the next version and does not match a version by its prefix', () => {
    expect(changelogSection(changelog, '0.1.1')).toBe('- An older line.')
  })

  it('fails on a version the changelog does not have', () => {
    expect(() => changelogSection(changelog, '9.9.9')).toThrow('no section for 9.9.9')
  })
})
