import { fairy, type MascotData } from '../components/mascot/fairy'

export type { MascotData }

export type LumenMascotVariant = 'default' | 'empty'

const registry = new Map<string, MascotData>(Object.entries(fairy))
const listeners = new Set<() => void>()

export function registerMascot(variants: Partial<Record<LumenMascotVariant, MascotData>>) {
  Object.entries(variants).forEach(([variant, data]) => registry.set(variant, data))
  listeners.forEach((listener) => listener())
}

export function mascotData(variant: string): MascotData | undefined {
  return registry.get(variant)
}

export function onMascotRegistered(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
