export interface LumenTheme {
  primary?: string
  secondary?: string
}

export function setLumenTheme({ primary, secondary }: LumenTheme, root: HTMLElement = document.documentElement): void {
  if (primary !== undefined) {
    root.style.setProperty('--lu-theme-primary', primary)
  }
  if (secondary !== undefined) {
    root.style.setProperty('--lu-theme-secondary', secondary)
  }
}
