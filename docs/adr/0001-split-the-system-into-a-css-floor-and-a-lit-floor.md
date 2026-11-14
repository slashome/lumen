# ADR-0001 — Split the system into a CSS floor and a Lit floor

- **Status:** Accepted, amended by [ADR-0009](0009-describe-components-by-usage-not-by-floor.md)
- **Date:** 2026-10-31
- **Concerns:** `slashome/ariane#R012` (private content tree)

## Context

Lumen is extracted from `ariane/web/src/shared/ui`: 23 React 19 exports on Radix, Tailwind 4 and `cva`. It must serve React, Vue, Svelte and plain HTML. Radix runs only in React. The rule this repository follows: check the platform and the ARIA pattern before writing a component, and keep the semantic token layer full, so that no color travels as a prop or an inline style.

## Decision

- **Everything public is prefixed `lu-`**: elements (`<lu-dialog>`), classes (`.lu-button`), custom properties (`--lu-color-primary`), events (`lu-open-change`) and cascade layers (`lu.components`). The package keeps the full name, `@slashome/lumen`.
- **Floor 0 is CSS.** Tokens, and every component without state, as BEM classes inside the cascade layers `lu.tokens`, `lu.base` and `lu.components`: `.lu-button`, `.lu-icon-button`, `.lu-badge`, `.lu-input`, `.lu-native-select`, `.lu-switch` (a native checkbox with `role="switch"`), `.lu-kbd`, the page states, `.lu-markdown`, `.lu-data-table`, `.lu-mark`. Light DOM, no JavaScript.
- **Floor 1 is Lit**, in Shadow DOM, for what has state: dialogs on `<dialog>`, floating panels on the popover API positioned by Floating UI, selects, toasts, Markdown, highlight, drag and drop. Elements are written with `static properties`, without decorators, so any TypeScript or JavaScript toolchain compiles them.
- Floor 1 reuses floor 0 by importing its CSS files with `?inline` into its shadow roots.
- **The data table is floor 0**, where `slashome/ariane#R012` placed it on floor 1. Sorting needs no state of its own in an element: a `.lu-data-table` class draws it, `sortRows` orders the rows and `storedSort()` keeps the column and direction across visits. Its rows and cells are the consumer's own markup, which a shadow root would cut off from the page's styles.
- Events are `CustomEvent`s named `lu-*`, bubbling and composed.

## Consequences

- Vanilla, Vue and Svelte use the same classes and elements as React, with no adapter.
- React gets `@slashome/lumen/react`, a thin adapter built on `@lit/react` that keeps React's idioms (`open`/`onOpenChange`, `value`/`onValueChange`) and renders floor 0 as components. The data table is a floor-0 pattern plus `sortRows` and `storedSort`; only the React adapter wraps it in a component, because its cells are arbitrary framework content.
- Text content is not encapsulated: `<lu-markdown>` and `<lu-highlight>` render into the light DOM, so the page can select it, search it and style it, and tests can query it. Their styles are floor 0 (`.lu-markdown`, `.lu-mark`).
- `@lit/react` resolves to its server-rendering build under the `node` export condition, which never sets properties. A React consumer testing under Vitest aliases `@lit/react` to its `development/index.js` browser build, as `vite.config.ts` does here.
- Content slotted into floor 1 stays in the light DOM and keeps the page's styles; what a shadow root draws is themed only through tokens and `::part()`.
- A floor-1 element exists only once its JavaScript runs: server-rendered or static pages get the floor-0 classes, never an empty custom element in place of content.

## Alternatives considered

### Keep the React components and wrap them as custom elements

Least work, but every Vue or vanilla consumer then ships React, and Radix portals escape the shadow root they are rendered from.

### One implementation per framework (Radix for React, Reka UI for Vue)

Two interactive implementations to keep aligned forever, and none for vanilla.

### Tailwind inside the components

A shadow root does not see the page's utilities; each component would embed its own compiled Tailwind for an isolation it already has.

## Revisit if

Server rendering of custom elements (declarative shadow DOM from the framework) becomes something a consumer needs, or a framework's support for custom elements regresses.
