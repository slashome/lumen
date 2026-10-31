---
'@slashome/lumen': minor
---

Add `<lu-combobox>` (`@slashome/lumen/combobox`), a text field on the ARIA combobox pattern that filters its `options` as the user types, picks one value or, with `multiple`, several drawn as removable tags, and with `creatable` offers a text no option matches as a new value. With `skip-filter` and `loading`, the application loads the options when `lu-search` (`{ query }`, fired on every change of the text) tells it what was typed. It fires a cancelable `lu-value-change` with the new value, a string or an array with `multiple`, and the sources `option`, `create`, `remove` or `clear`; `ValueChangeSource` gains `create` and `remove`. With a `name`, its values are submitted with its form. `label` is required. React gets `Combobox`, Vue `LuCombobox` with `v-model:value`. Three new required keys in `LumenMessages`: `comboboxNoResults`, `comboboxCreate`, `comboboxResults`.
