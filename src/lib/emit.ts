export function emit<Detail>(host: HTMLElement, name: string, detail: Detail): boolean {
  return host.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }))
}
