---
'@slashome/lumen': minor
---

Lumen ships no text. Register the generic labels once at start-up with `registerLumenMessages(lang, messages)` (or `app.use(lumen, { messages })` in Vue); `LumenMessages` lists the required keys and `lumenMessageKeys` checks them at run time. `close-label`, `cancel-label`, `clear-label`, the new `label` of `lu-toaster` and `role-description` of `lu-draggable` override the registry; `confirm-label` is required on every `lu-confirm-dialog`, which no longer has `close-label`. A missing label logs a console error and renders nothing. `lu-pickup`, `PickupDetail`, React `onPickup` and Vue `onLuPickup` are removed: `lu-draggable` calls its `lu-drag-area` directly.
