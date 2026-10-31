#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { changelogSection } from './changelog-section.js'

const version = process.argv[2] ?? JSON.parse(await readFile('package.json', 'utf8')).version
process.stdout.write(`${changelogSection(await readFile('CHANGELOG.md', 'utf8'), version)}\n`)
