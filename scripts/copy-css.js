#!/usr/bin/env node
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const destination = 'dist/css'
const aggregate = 'src/foundations/lumen.css'

async function cssFiles(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true })
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.css')).map((entry) => join(entry.parentPath, entry.name))
}

const sources = [...(await cssFiles('src/foundations')), ...(await cssFiles('src/components'))]
const names = sources.map((source) => basename(source))
const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
if (duplicates.length > 0) {
  throw new Error(`css: two files would land on the same name in ${destination}: ${duplicates.join(', ')}`)
}

await mkdir(destination, { recursive: true })
await Promise.all(sources.filter((source) => source !== aggregate).map((source) => copyFile(source, join(destination, basename(source)))))
const flattened = (await readFile(aggregate, 'utf8')).replace(/@import '[^']*\/([^/']+\.css)';/g, "@import './$1';")
await writeFile(join(destination, 'lumen.css'), flattened)
console.log(`css: ${destination}`)
