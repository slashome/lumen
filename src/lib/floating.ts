import { autoUpdate, computePosition, flip, offset, shift, size, type Placement } from '@floating-ui/dom'

export interface FloatOptions {
  placement?: Placement
  gap?: number
  matchWidth?: boolean
}

export function float(anchor: Element, floating: HTMLElement, { placement = 'bottom-start', gap = 4, matchWidth = false }: FloatOptions = {}): () => void {
  const update = () =>
    computePosition(anchor, floating, {
      placement,
      strategy: 'fixed',
      middleware: [
        offset(gap),
        flip(),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableHeight, rects }) {
            floating.style.setProperty('--lumen-available-height', `${Math.max(0, availableHeight)}px`)
            if (matchWidth) {
              floating.style.setProperty('--lumen-anchor-width', `${rects.reference.width}px`)
            }
          },
        }),
      ],
    }).then(({ x, y }) => {
      floating.style.left = `${x}px`
      floating.style.top = `${y}px`
    })
  return autoUpdate(anchor, floating, update)
}
