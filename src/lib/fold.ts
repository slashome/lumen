const spelled: Record<string, string> = { æ: 'ae', œ: 'oe', ß: 'ss', ø: 'o', đ: 'd', ħ: 'h', ı: 'i', ł: 'l', ŧ: 't' }

export interface Folded {
  text: string
  origin: number[]
}

export function fold(text: string): Folded {
  let folded = ''
  const origin: number[] = []
  Array.from(text).forEach((character, index) => {
    for (const lower of character.toLowerCase()) {
      const plain = spelled[lower] ?? lower.normalize('NFD').replace(/\p{M}/gu, '')
      folded += plain
      for (let unit = 0; unit < plain.length; unit += 1) {
        origin.push(index)
      }
    }
  })
  return { text: folded, origin }
}

export function foldText(text: string): string {
  return fold(text).text
}
