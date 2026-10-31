import js from '@eslint/js'
import lit from 'eslint-plugin-lit'
import wc from 'eslint-plugin-wc'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'src/icons/generated.ts', 'src/react/elements.ts', 'src/vue/elements.ts', 'custom-elements.json'] },
  {
    files: ['**/*.{ts,js}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, lit.configs['flat/recommended'], wc.configs['flat/recommended']],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
)
