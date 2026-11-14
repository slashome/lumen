/** `'destructive'` is deprecated: use `'danger'`, which draws the same. Removed in the next major version. */
export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'danger' | 'destructive'
export type ButtonSize = 'default' | 'sm' | 'icon'

export interface ButtonLook {
  variant?: ButtonVariant | null
  size?: ButtonSize | null
}

function variantModifier(variant: ButtonVariant): string {
  return variant === 'destructive' ? 'danger' : variant
}

export function buttonClasses({ variant = 'default', size = 'default' }: ButtonLook = {}): string {
  return [
    'lu-button',
    variant && variant !== 'default' && `lu-button--${variantModifier(variant)}`,
    size && size !== 'default' && `lu-button--${size}`,
  ]
    .filter(Boolean)
    .join(' ')
}

export function busyAttributes(loading: boolean): { 'aria-busy'?: 'true'; 'aria-disabled'?: 'true' } {
  return loading ? { 'aria-busy': 'true', 'aria-disabled': 'true' } : {}
}

export function blockedWhile<Event extends { preventDefault(): void }>(loading: boolean, onClick: ((event: Event) => void) | undefined) {
  return (event: Event) => {
    if (loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }
}
