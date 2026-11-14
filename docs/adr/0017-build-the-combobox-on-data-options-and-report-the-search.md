# ADR-0017 — Build the combobox on data options, and report the search without delay

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0011, ADR-0012, ADR-0014, ADR-0016, `slashome/lumen#T029`, `slashome/lumen#T030`

## Context

`lu-combobox` (`slashome/lumen#T030`) is the ARIA combobox with a listbox popup: the focus stays in a text input, and `aria-activedescendant` names the active option. The owner decided on 2026-10-31 that it picks one value or several, the several drawn as `lu-tag` (`slashome/lumen#T029`), that it filters its options or lets the application load them through `lu-search`, that it creates a value no option matches, and that it follows ADR-0011 with `lu-value-change`. Four questions were left open.

An IDREF does not cross a shadow boundary. `lu-select` takes `lu-option` children, which stay in the light DOM while its input would sit in its shadow root; pointing `aria-activedescendant` across that boundary needs `ariaActiveDescendantElement`, Baseline « newly available » only (`web-features` 3.44.0, `aria-attribute-reflection`, `by_compat_key`). `lu-multi-select` already takes its options as data.

`lu-tag` fires `lu-remove`, public, bubbling and composed. Rendered inside the combobox, it would reach the page from the combobox host, an event the combobox does not document. ADR-0012 says elements of Lumen call each other's methods rather than send each other private events.

A native `<select multiple>` keeps one `value` and adds `selectedOptions`; Web Awesome's `wa-select` holds a string, or an array with `multiple`.

## Decision

- **Options are data**, `options: { value, label }[]`, rendered with their ids in the shadow root of the combobox, next to the input that points to them. `lu-option` is not reused.
- **One property, `value`, whose type follows `multiple`**: a string without it, an array of strings with it; the attribute takes a JSON array. `lu-value-change` carries the same shape, with the sources `option`, `create`, `remove` and `clear`. A value no option has is shown as itself, and the element remembers the label of every option it has been given, so a value keeps its label when the application replaces the options.
- **`lu-search` fires on every change of the text, without delay**, by the user or when the element empties it after a choice. Debouncing, cancelling a late answer and caching are the application's, which knows its server; the element adds no timer.
- **`skip-filter`** shows the options as given, for options the application loads; without it the element filters them itself, ignoring case and accents with `foldText`. **`loading`** shows the `loading` message in place of the options.
- **An element that renders another in its own shadow root owns it**, and listens to its public events as an application would. `lu-combobox` handles the `lu-remove` of its tags, stops its propagation there, and fires its own `lu-value-change`. This is not a private channel: `lu-remove` stays public, and `lu-tag` knows nothing of the combobox.
- **`lu-remove` is not cancelable.** The tag changes no state of its own; the owner removes the value, as it runs the action after `lu-confirm` (ADR-0011).
- **The combobox is form-associated** (ADR-0016): one entry per value under `name`, a reset empties it.

## Consequences

- `aria-activedescendant` works in every Baseline « widely available » browser, without element reflection. The options cannot hold markup of the application, only a label.
- TypeScript sees `string | string[]` and the application narrows it by `multiple`; the Vue model `v-model:value` takes both.
- An application that loads options on every keystroke without debouncing sends a request per character; the story shows one that keeps only the answer to the last text.
- Stopping `lu-remove` inside the combobox means a page listener on `lu-remove` hears only the tags it renders itself.

## Alternatives considered

### `lu-option` children, as `lu-select`

One way to describe options in both selects. The ids of the options would sit outside the shadow root of the input, and `aria-activedescendant` would need `ariaActiveDescendantElement`, which is not « widely available » (ADR-0014).

### `values` and `lu-values-change` with `multiple`

Each property would have one type. Two names for one state that only `multiple` separates, and an event other than the `lu-value-change` the owner asked for.

### A debounce in the element, with a `search-delay` attribute

What many comboboxes ship. A timer in the element delays every application, including the one that filters a local list on each keystroke, and still leaves cancelling a late answer to the application.

### Let `lu-remove` of the tags reach the page

No stop, nothing hidden. The page would get an undocumented event from the combobox, before or after its `lu-value-change`, for the same user action.

## Revisit if

`ariaActiveDescendantElement` becomes Baseline widely available, which would let the combobox take `lu-option` children; or an application needs options with markup, such as an avatar beside a name.
