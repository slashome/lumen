# ADR-0016 — Associate an element that holds a value with its form

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001, ADR-0011, ADR-0012, ADR-0014, `slashome/lumen#T028`

## Context

`lu-file-drop` (`slashome/lumen#T028`) holds files the user chose, which the application sends. Before it, no element of Lumen took part in a form: `lu-select` and `lu-multi-select` hold a value but are read through their property and their event.

A `<input type="file">` inside a shadow root is invisible to the `<form>` around its host: `new FormData(form)` and a submit skip it. Three ways to reach the form exist: a form-associated custom element, which hands its value to the form through `ElementInternals`; a hidden input copied into the light DOM; or nothing, the application reading `files` and building its request.

Form-associated custom elements are Baseline « widely available » since 2025-09-27, for every compat key Lumen calls: `attachInternals`, `ElementInternals.setFormValue`, `form`, `labels`, `setValidity` (`web-features` 3.44.0, `form-associated-custom-elements`, `status.by_compat_key`). jsdom 30 has `attachInternals` but no `setFormValue` (`node -e "new (require('jsdom').JSDOM)('').window.ElementInternals.prototype.setFormValue"` is `undefined`).

`setValidity()` refuses a flag without a message, so native constraint validation (`required`) needs a text that Lumen does not ship (ADR-0012).

ADR-0011 names the change event `lu-<noun>-change`, with the noun of the property it changes. A file input exposes its files as `files`; its `value` is a string, a fake path.

## Decision

- **An element that holds a value a form submits is form-associated**: `static formAssociated = true`, and `setFormValue()` each time the value or `name` changes. `lu-file-drop` is the first; `lu-select` and `lu-multi-select` may follow, in their own change.
- **`name` gives the field name**; without it, the element submits nothing, as a nameless input.
- **A form reset empties the element** (`formResetCallback`) without an event, as setting the property does. **A disabled ancestor `<fieldset>` disables it** (`formDisabledCallback`).
- **No native validation**: no `required`, no `setValidity()`. The application validates, and shows its error in a `.lu-field__error`.
- **The property and the event follow the platform's noun**: `lu-file-drop` holds `files` and fires `lu-files-change` with `{ files, source }`, its sources `drop`, `picker` and `remove`. A refused file fires `lu-reject`, not cancelable, with each file and its reason.
- **`@slashome/lumen/testing` stands in for `setFormValue`** where jsdom lacks it, with a function that does nothing; the browser tests check the form data.
- The static fields `formAssociated` and `shadowRootOptions` are tagged `@internal`, which keeps them out of `custom-elements.json`.

## Consequences

- `new FormData(form)`, a submit and a reset treat `lu-file-drop` as a native file input; an application that sends JSON reads `files` instead.
- Under jsdom, a form never sees the files: a consumer's unit test reads `files`, not the form data.
- A required file is checked by the application, not by the browser's validation bubble.
- The outer `<label for>` names the host, not the input inside its shadow root: the element is named by its own required `label`, as `lu-select` is.

## Alternatives considered

### `lu-value-change` and `value`

One event name for every field, and the Vue model `value` for free. It gives `value` a meaning, a list of `File`, that no native form control has, and it holds the files under the name the platform uses for a string.

### A hidden `<input type="file">` in the light DOM, filled from a `DataTransfer`

Works without `ElementInternals`, but writes into the application's DOM, and a framework that re-renders the host's children removes it.

### Nothing, the application reads `files`

The simplest, and what an application sending JSON does anyway. A plain HTML form would lose the files without a word.

## Revisit if

Lumen ships validation messages, which would let `required` use `setValidity()`; or a framework mishandles form-associated custom elements.
