export function nextIndex(key: string, current: number, count: number): number | null {
  if (count === 0) {
    return null
  }
  switch (key) {
    case 'ArrowDown':
      return current < 0 ? 0 : Math.min(count - 1, current + 1)
    case 'ArrowUp':
      return current < 0 ? count - 1 : Math.max(0, current - 1)
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}

export function typeahead(labels: string[], query: string, from: number): number {
  const needle = query.toLowerCase()
  for (let offset = 1; offset <= labels.length; offset += 1) {
    const index = (from + offset) % labels.length
    if (labels[index]?.toLowerCase().startsWith(needle)) {
      return index
    }
  }
  return -1
}
