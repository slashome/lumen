export function changelogSection(changelog, version) {
  const lines = changelog.split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${version}`)
  if (start === -1) {
    throw new Error(`changelog: no section for ${version}`)
  }
  const length = lines.slice(start + 1).findIndex((line) => /^## /.test(line))
  const end = length === -1 ? lines.length : start + 1 + length
  return lines.slice(start + 1, end).join('\n').trim()
}
