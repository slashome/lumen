---
'@slashome/lumen': minor
---

`label` is required on `lu-select`, `lu-multi-select`, `lu-segmented` and `lu-tabs`: required in the React and Vue types (`SelectElement`, `LuSelect` and the global `lu-select` component included), marked required in `custom-elements.json`, and a console error when it is missing. `lu-dialog`, `lu-sheet` and `lu-confirm-dialog` log an error without `heading` or a `heading` slot. `LumenMessages` gains a required `confirm` key: `confirm-label` on `lu-confirm-dialog` and `confirmLabel` in React become optional and win over it.
