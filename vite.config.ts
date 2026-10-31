import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

const external = [/^lit/, /^@lit\//, /^@floating-ui\//, /^@atlaskit\//, 'marked', 'dompurify', /^react/, 'vue']

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        lib: 'src/lib/index.ts',
        react: 'src/react/index.tsx',
        vue: 'src/vue/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: { external },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'storybook-static/**'],
  },
})
