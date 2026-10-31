#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { getIconData } from '@iconify/utils'

const [mappingPath, outputPath] = process.argv.slice(2)
if (!mappingPath || !outputPath) {
  console.error('usage: lumen-icons <mapping.json> <output.ts>')
  process.exit(1)
}

const require = createRequire(join(process.cwd(), 'package.json'))
const sets = new Map()

async function iconSet(prefix) {
  if (!sets.has(prefix)) {
    const path = require.resolve(`@iconify-json/${prefix}/icons.json`)
    sets.set(prefix, JSON.parse(await readFile(path, 'utf8')))
  }
  return sets.get(prefix)
}

async function resolve(name, id) {
  const [prefix, icon] = id.split(':')
  if (!prefix || !icon) {
    throw new Error(`${name}: "${id}" is not an Iconify id like "lucide:x"`)
  }
  const set = await iconSet(prefix)
  const data = getIconData(set, icon)
  if (!data) {
    throw new Error(`${name}: ${id} does not exist in @iconify-json/${prefix}`)
  }
  return { body: data.body, width: data.width ?? set.width ?? 16, height: data.height ?? set.height ?? 16 }
}

const mapping = JSON.parse(await readFile(mappingPath, 'utf8')).icons
const entries = []
for (const [name, id] of Object.entries(mapping)) {
  entries.push([name, await resolve(name, id)])
}

const body = entries.map(([name, icon]) => `  ${JSON.stringify(name)}: ${JSON.stringify(icon)},`).join('\n')
await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `export const icons = {\n${body}\n} as const\n`)
console.log(`icons: ${entries.length} written to ${outputPath}`)
