export interface Token {
  variable: string
  value: string
  description: string
  deprecated: string | null
}

function isGroup(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null
}

function deprecation(node: Record<string, unknown>): string | null {
  const flag = node.$deprecated
  if (flag === undefined || flag === false) return null
  return typeof flag === 'string' ? flag : ''
}

export function tokensOf(group: Record<string, unknown>, path: string[] = []): Token[] {
  return Object.entries(group).flatMap(([key, node]) => {
    if (key.startsWith('$') || !isGroup(node)) return []
    const nodePath = [...path, key]
    if (!('$value' in node)) return tokensOf(node, nodePath)
    return [{ variable: `--lu-${nodePath.join('-')}`, value: String(node.$value), description: String(node.$description ?? ''), deprecated: deprecation(node) }]
  })
}
