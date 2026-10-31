import { deprecatedInClassTags, publicApiOnly, requiredMembers, taggedElementsOnly } from './scripts/manifest-plugins.js'

export default {
  globs: ['src/components/**/*.ts'],
  exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts'],
  litelement: true,
  outdir: '.',
  plugins: [requiredMembers(), publicApiOnly(), deprecatedInClassTags(), taggedElementsOnly()],
}
