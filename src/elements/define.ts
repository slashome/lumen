export function define(name: string, element: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, element)
  }
}
