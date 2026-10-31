const litSelector = '.lu-button, .lu-icon-button, .lu-switch, [data-lu-light]'

export function light(element: Element) {
  element.removeAttribute('data-lu-lit')
  void (element as HTMLElement).offsetWidth
  element.setAttribute('data-lu-lit', '')
  element.addEventListener('animationend', () => element.removeAttribute('data-lu-lit'), { once: true })
}

export function attachLight(root: Document | ShadowRoot | HTMLElement = document): () => void {
  const onClick = (event: Event) => {
    const target = event.composedPath().find((node): node is Element => node instanceof Element && node.matches(litSelector))
    if (target) {
      light(target)
    }
  }
  root.addEventListener('click', onClick)
  return () => root.removeEventListener('click', onClick)
}
