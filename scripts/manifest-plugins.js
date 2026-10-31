const internal = new Set(['private', 'protected'])
const declaredInClassTags = ['events', 'slots', 'cssParts', 'cssProperties']
const deprecation = /^(.*?)\s*@deprecated\b\s*(.*)$/s

function classesOf(manifest) {
  return manifest.modules.flatMap((module) => module.declarations ?? []).filter((declaration) => declaration.kind === 'class')
}

function isPublic(member) {
  return !internal.has(member.privacy)
}

export function publicApiOnly() {
  return {
    name: 'lumen/public-api-only',
    packageLinkPhase({ customElementsManifest }) {
      for (const declaration of classesOf(customElementsManifest)) {
        const hidden = new Set((declaration.members ?? []).filter((member) => !isPublic(member)).map((member) => member.name))
        declaration.members = declaration.members?.filter(isPublic)
        declaration.attributes = declaration.attributes?.filter((attribute) => !hidden.has(attribute.fieldName))
      }
    },
  }
}

export function deprecatedInClassTags() {
  return {
    name: 'lumen/deprecated-in-class-tags',
    packageLinkPhase({ customElementsManifest }) {
      for (const declaration of classesOf(customElementsManifest)) {
        for (const kind of declaredInClassTags) {
          for (const item of declaration[kind] ?? []) {
            const match = item.description?.match(deprecation)
            if (match) {
              item.description = match[1]
              item.deprecated = match[2] || true
            }
          }
        }
      }
    },
  }
}
