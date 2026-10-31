---
'@slashome/lumen': patch
---

`tokens.css` gives every color derived with `oklch(from …)` a fallback for browsers without relative color syntax: there, `--lu-color-primary`, `--lu-color-primary-foreground`, `--lu-color-ring`, `--lu-color-accent` and `--lu-color-highlight` take the values of the default theme, so dark mode keeps its primary fills and text on them stays readable. Current browsers still follow `--lu-theme-primary` and `--lu-theme-secondary`.
