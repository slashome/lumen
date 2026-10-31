import { deprecatedInClassTags, publicApiOnly } from './scripts/manifest-plugins.js'

export default {
  globs: ['src/components/**/*.ts'],
  exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts'],
  litelement: true,
  outdir: '.',
  plugins: [publicApiOnly(), deprecatedInClassTags()],
}
