# ADR-0020 — Name the framework components Lu*

- **Status:** Accepted
- **Date:** 2026-11-14
- **Concerns:** ADR-0001, ADR-0005, ADR-0006, ADR-0013

## Context

The two adapters named the same component differently. `@slashome/lumen/vue` exports `LuDialog`, `LuSelect` and the other stateful elements with the prefix, because Vue needs it: the Vue style guide asks for multi-word component names, and an in-DOM template is parsed by the browser before Vue sees it, so `<Dialog>`, `<Select>`, `<Button>` or `<Input>` collide with the native `<dialog>`, `<select>`, `<button>` and `<input>` once lower-cased. `@slashome/lumen/react` exported `Button`, `Dialog`, `Select`, following React's convention: a library exports unprefixed names and the consumer renames on import if two collide.

The result was one component under two names. The documentation had to say `Tooltip` in one paragraph and `LuTooltip` in the next, a search for `LuDialog` missed every React call site, and an application written in both frameworks, or moving from one to the other, renamed every component on the way.

The owner decided on 2026-11-14 that a component has one name in every framework and in the documentation.

Lumen is `0.x`. ADR-0006 asks for a deprecation that lives a minor version before a removal, because Ariane already depends on Lumen.

## Decision

- **Every component exported by `@slashome/lumen/react` is `Lu<Name>`**, the name Vue uses: `LuButton`, `LuDialog`, `LuSelect`, `LuSelectItem`, `LuDataTable`, `LuToaster`, `LuHighlightTerms`… **Its props type follows it**: `LuButtonProps`, `LuSegmentedProps`.
- **Hooks, functions and value types keep their names**: `toast`, `classes`, `buttonClasses`, `useStoredSort`, `useHighlightTerms`, `ButtonVariant`, `ButtonSize`, `OpenChangeHandler`, `Column`, `DragEndEvent`. They name no component, and a hook must start with `use`.
- **A component added to either adapter takes the prefix**, and one that exists in both has the same name and the same props. `src/react/react.test.tsx` fails when the React adapter exports a capitalised name without `Lu`.
- **The old names are removed without a deprecation**, in `0.3.0`. This is a decided exception to ADR-0006, not a change of it: an alias for every component would double the exported API for a rename that only touches import lines, and Ariane, the one consumer, renames them in one pass.
- The generated wrappers of `src/react/elements.ts` keep their `<Name>Element` names: they are internal to the adapter.

## Consequences

- A component has one name in the README, the Storybook, the Vue adapter and the React adapter; a search finds every use.
- React code reads `<LuButton>` where the ecosystem writes `<Button>`. An application that prefers the short name renames on import, `import { LuButton as Button }`.
- Every React consumer edits its imports and its JSX on the upgrade to `0.3.0`, with nothing in the editor to point at the old names first.
- The accepted ADRs keep the names that were true when they were written (`Tooltip` in ADR-0013, `Button` in ADR-0005).

## Alternatives considered

### Keep React unprefixed and Vue prefixed

Each adapter follows its framework, which is what existed. It is the two names for one component that this decision removes.

### Drop the prefix in Vue

One name, the short one. It brings back the collisions with `<dialog>`, `<select>` and `<button>` in in-DOM templates and breaks the Vue style guide's multi-word rule.

### Deprecated aliases for one minor version, as ADR-0006 asks

The safe path for a consumer. It doubles the React exports for a release, each alias with its own `@deprecated` line, for a rename a find-and-replace does, and the owner chose to ship it at once.

## Revisit if

Lumen gains consumers outside slashome before 1.0, for whom a rename without a deprecation window would be a surprise; or a framework adapter is added whose convention forbids the prefix.
