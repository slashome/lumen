---
'@slashome/lumen': minor
---

`.lu-button` draws a loading state on `aria-busy="true"`: a spinner in the text color before the label, the progress cursor, and the button keeps its focus (pair it with `aria-disabled="true"`, not `disabled`). `a.lu-button` now draws exactly as the button, without an underline. `@slashome/lumen/vue` gains `LuButton` (`variant`, `size`, `type` defaulting to `button`, `href`, `loading`), drawing the same classes as React. In React and in Vue, `LuButton` given `href` renders an `<a>` styled as a button, without `type`, and given `loading` sets `aria-busy` and `aria-disabled`, keeps the focus and blocks the click, so neither `onClick`, the form submission nor the navigation happens.
