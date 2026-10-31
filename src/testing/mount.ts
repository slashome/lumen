export async function mount<Element extends HTMLElement & { updateComplete: Promise<boolean> }>(markup: string): Promise<Element> {
  document.body.innerHTML = markup
  const element = document.body.firstElementChild as Element
  await element.updateComplete
  return element
}
