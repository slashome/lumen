function matches(file: File, token: string): boolean {
  if (token.startsWith('.')) {
    return file.name.toLowerCase().endsWith(token)
  }
  const type = file.type.toLowerCase()
  if (token.endsWith('/*')) {
    return type.startsWith(token.slice(0, -1))
  }
  return type === token
}

export function accepts(accept: string, file: File): boolean {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  return tokens.length === 0 || tokens.some((token) => matches(file, token))
}

export function sameFile(left: File, right: File): boolean {
  return left.name === right.name && left.size === right.size && left.lastModified === right.lastModified
}
