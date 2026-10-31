import { defineConfig } from 'vite'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { configDefaults } from 'vitest/config'

const litReactForBrowsers = join(dirname(createRequire(import.meta.url).resolve('@lit/react')), '..', 'development', 'index.js')

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
      },
      formats: ['es'],
    },
    rollupOptions: { external },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
    alias: [{ find: /^@lit\/react$/, replacement: litReactForBrowsers }],
    exclude: [...configDefaults.exclude, 'storybook-static/**'],
  },
})
