import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { render } from './token-css.js'

let root

async function write(path, content) {
  await mkdir(join(root, path, '..'), { recursive: true })
  await writeFile(join(root, path), JSON.stringify(content))
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'lumen-tokens-'))
  await write('primitive/color.json', { color: { $type: 'color', gray: { 500: { $value: '#777777' } } } })
  await write('semantic/light/color.json', {
    color: {
      $type: 'color',
      quiet: { $value: '{color.gray.500}', $description: 'Secondary text.' },
      faint: { $value: '{color.gray.500}', $description: 'Secondary text, formerly.', $deprecated: 'Use color.quiet.' },
      dim: { $value: '{color.gray.500}', $description: 'Dimmed text.', $deprecated: true },
    },
  })
})

afterAll(() => rm(root, { recursive: true, force: true }))

describe('token CSS', () => {
  it('writes the deprecation, with its reason, into the comment of a deprecated token', async () => {
    const { css } = await render([join(root, '**/*.json')])
    expect(css).toContain('--lu-color-faint: var(--lu-color-gray-500); /** Deprecated. Use color.quiet. Secondary text, formerly. */')
    expect(css).toContain('--lu-color-dim: var(--lu-color-gray-500); /** Deprecated. Dimmed text. */')
    expect(css).toContain('--lu-color-quiet: var(--lu-color-gray-500); /** Secondary text. */')
  })

  it('lists the deprecated tokens for the build to report', async () => {
    const { deprecated } = await render([join(root, '**/*.json')])
    expect(deprecated).toEqual(['--lu-color-faint', '--lu-color-dim'])
  })
})
