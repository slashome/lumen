export interface EmitOptions {
  cancelable?: boolean
}

export function emit<Detail>(host: HTMLElement, name: string, detail: Detail, { cancelable = false }: EmitOptions = {}): boolean {
  return host.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable }))
}
