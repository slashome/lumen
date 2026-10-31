#!/usr/bin/env node
import { cp } from 'node:fs/promises'

await cp('src/css', 'dist/css', { recursive: true })
console.log('css: dist/css')
