---
'@slashome/lumen': minor
---

Add `setLumenTheme({ primary, secondary }, root?)`, exported by `@slashome/lumen` and `@slashome/lumen/lib`: it sets `--lu-theme-primary` and `--lu-theme-secondary` on `document.documentElement`, or on the element given, only for the colors it is given, and can be called again at any time to change the theme. The Vue plugin takes it as an option, `app.use(lumen, { messages, theme: { primary, secondary } })`; `LumenTheme` types it. In React, call the function at start-up, with no provider.
