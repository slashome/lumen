const litSelector = '.lumen-button, .lumen-icon-button, .lumen-switch, [data-lumen-light]'

export function light(element: Element) {
  element.removeAttribute('data-lumen-lit')
  void (element as HTMLElement).offsetWidth
  element.setAttribute('data-lumen-lit', '')
  element.addEventListener('animationend', () => element.removeAttribute('data-lumen-lit'), { once: true })
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
