export function isPopoverOpen(element: Element | null | undefined): boolean {
  if (!element) {
    return false
  }
  try {
    return element.matches(':popover-open')
  } catch {
    return element.hasAttribute('data-lu-popover-open')
  }
}
