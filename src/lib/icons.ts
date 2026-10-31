import { icons as bundled } from '../icons/generated'

export interface IconData {
  body: string
  width: number
  height: number
}

export type LumenIconName = keyof typeof bundled

const registry = new Map<string, IconData>(Object.entries(bundled))
const listeners = new Set<() => void>()

export function registerIcons(icons: Record<string, IconData>) {
  Object.entries(icons).forEach(([name, data]) => registry.set(name, data))
  listeners.forEach((listener) => listener())
}

export function iconData(name: string): IconData | undefined {
  return registry.get(name)
}

export function iconNames(): string[] {
  return [...registry.keys()].sort()
}

export function onIconsRegistered(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
