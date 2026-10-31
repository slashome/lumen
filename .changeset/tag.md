---
'@slashome/lumen': minor
---

Add the CSS class `.lu-tag` for a value shown as a tag, and `<lu-tag removable>` (`@slashome/lumen/tag`), a tag with a remove button that fires `lu-remove` (`{ value }`, not cancelable) on a click, Delete or Backspace, and leaves its removal to the owner. React gets `Tag`, which draws the class without `onRemove` and the element with it. One new required key in `LumenMessages`: `tagRemove`, which names the remove button from the text of the tag.
