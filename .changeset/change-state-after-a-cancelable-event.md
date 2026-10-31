---
'@slashome/lumen': minor
---

Every element now changes the state the user changes, after a cancelable event that says why. `lu-dialog`, `lu-sheet` and `lu-confirm-dialog` close themselves on Escape, the backdrop, the close or cancel button; `lu-tooltip` and `lu-hover-card` gain an `open` property and fire `lu-open-change`. To keep control, cancel `lu-open-change` and set `open` yourself. Every `lu-*-change` detail carries a `source` (`escape`, `outside`, `close-button`, `cancel`, `trigger`, `panel`, `form`, `option`, `clear`). The React components are controlled when given `open`, `value` or `selected`, and uncontrolled without; `onOpenChange` and the value callbacks receive the source as a second argument. `@slashome/lumen/vue` exports `LuDialog`, `LuSelect` and the other stateful elements with `v-model:open`, `v-model:value` and `v-model:selected`.
