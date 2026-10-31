import { describe, expect, it } from 'vitest'
import manifest from '../package.json'

const sources = import.meta.glob<string>(['./components/**/*.ts', '!./components/**/*.test.ts', '!./components/**/*.stories.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const exports: Record<string, unknown> = manifest.exports

function component(path: string) {
  const [, folder, file] = path.match(/^\.\/components\/([^/]+)\/([^/]+)\.ts$/) ?? []
  return { folder, isEntry: folder !== undefined && folder === file }
}

const elements = Object.keys(sources)
  .map(component)
  .filter(({ isEntry }) => isEntry)
  .map(({ folder }) => folder)

function builtPath(path: string): string {
  const { folder, isEntry } = component(path)
  return isEntry ? `./dist/${folder}.js` : `./dist/${path.slice(2).replace(/\.ts$/, '.js')}`
}

describe('package.json', () => {
  it('exports one entry point per element', () => {
    expect(elements.length).toBeGreaterThan(0)
    for (const name of elements) {
      expect(exports[`./${name}`]).toEqual({ types: `./dist/types/components/${name}/${name}.d.ts`, default: `./dist/${name}.js` })
    }
  })

  it('declares as side effects every module that defines an element, and no other JavaScript', () => {
    const defining = Object.entries(sources)
      .filter(([, source]) => source.includes('define('))
      .map(([path]) => builtPath(path))
    expect(manifest.sideEffects.filter((path) => path.startsWith('./dist/') && path.endsWith('.js')).sort()).toEqual(['./dist/index.js', ...defining].sort())
  })

  it('ships the changelog', () => {
    expect(manifest.files).toContain('CHANGELOG.md')
  })
})
