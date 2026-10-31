#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { reactElements, vueElements } from './adapter-types.js'

const manifest = JSON.parse(await readFile('custom-elements.json', 'utf8'))

await writeFile('src/react/elements.ts', reactElements(manifest))
await writeFile('src/vue/elements.ts', vueElements(manifest))
console.log('adapters: src/react/elements.ts, src/vue/elements.ts')
