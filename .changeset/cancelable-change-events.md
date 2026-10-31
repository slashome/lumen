---
'@slashome/lumen': minor
---

`lu-value-change` on `lu-select` and `lu-segmented`, and `lu-selected-change` on `lu-multi-select`, now fire before the element updates its value, and `preventDefault()` keeps the current value. Every other `lu-*` event is no longer cancelable. `lu-pickup` is documented on `lu-draggable` and its `PickupDetail` type is exported.
