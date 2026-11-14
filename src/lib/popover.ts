const shimmedOpenFlag = 'data-lu-popover-open'

export function isPopoverOpen(element: Element | null | undefined): boolean {
  if (!element) {
    return false
  }
  if (element.hasAttribute(shimmedOpenFlag)) {
    return true
  }
  try {
    return element.matches(':popover-open')
  } catch {
    return false
  }
}
