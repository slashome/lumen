const litSelector = '.lu-button, .lu-icon-button, .lu-switch, .lu-checkbox, .lu-radio, [data-lu-light]'

function isInactive(element: Element) {
  return element.getAttribute('aria-busy') === 'true' || element.getAttribute('aria-disabled') === 'true'
}

export function light(element: Element) {
  element.removeAttribute('data-lu-lit')
  void (element as HTMLElement).offsetWidth
  element.setAttribute('data-lu-lit', '')
  element.addEventListener('animationend', () => element.removeAttribute('data-lu-lit'), { once: true })
}

export function attachLight(root: Document | ShadowRoot | HTMLElement = document): () => void {
  const onClick = (event: Event) => {
    const target = event.composedPath().find((node): node is Element => node instanceof Element && node.matches(litSelector))
    if (target && !isInactive(target)) {
      light(target)
    }
  }
  root.addEventListener('click', onClick)
  return () => root.removeEventListener('click', onClick)
}
