---
'@slashome/lumen': minor
---

Add `<lu-file-drop>` (`@slashome/lumen/file-drop`): a zone to drop files or choose them with the system picker, listing them with a remove button each. It fires a cancelable `lu-files-change` (`{ files, source }`, sources `drop`, `picker`, `remove`) and `lu-reject` for files that `accept` or a missing `multiple` refuses, and it never uploads. With a `name`, its files are submitted with its form. `label` is required. Six new required keys in `LumenMessages`: `fileDrop`, `fileBrowse`, `fileRemove`, `filesAdded`, `fileRemoved`, `fileRejected`. `@slashome/lumen/testing` stands in for `ElementInternals.setFormValue` under jsdom.
