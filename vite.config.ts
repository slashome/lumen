import { defineConfig } from 'vite'
import { existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { configDefaults } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const litReactForBrowsers = join(dirname(createRequire(import.meta.url).resolve('@lit/react')), '..', 'development', 'index.js')

const elements = readdirSync('src/components').filter((name) => existsSync(join('src/components', name, `${name}.ts`)))

const external = [/^lit/, /^@lit\//, /^@floating-ui\//, /^@atlaskit\//, 'marked', 'dompurify', /^react/, 'vue']

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        lib: 'src/lib/index.ts',
        react: 'src/react/index.tsx',
        vue: 'src/vue/index.ts',
        testing: 'src/testing/index.ts',
        ...Object.fromEntries(elements.map((name) => [name, `src/components/${name}/${name}.ts`])),
      },
      formats: ['es'],
    },
    rollupOptions: { external, output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' } },
    sourcemap: true,
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/testing/setup.ts'],
          alias: [{ find: /^@lit\/react$/, replacement: litReactForBrowsers }],
          exclude: [...configDefaults.exclude, 'storybook-static/**'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
