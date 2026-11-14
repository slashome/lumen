# ADR-0004 — One folder and one entry point per component

- **Status:** Accepted, amended by [ADR-0009](0009-describe-components-by-usage-not-by-floor.md)
- **Date:** 2026-10-31
- **Concerns:** ADR-0001

## Context

Lumen was sorted by technology: `src/css/` for floor 0, `src/elements/` for floor 1, one `elements.test.ts` and two story files, one per floor. Working on a component meant opening four places, and nothing showed which CSS, story and test belonged to which element.

`src/index.ts` registers every element as a side effect and `package.json` had no `sideEffects` field. A consumer who wanted only `<lu-select>` had one way in, the root, and shipped `marked`, `dompurify` and `@atlaskit/pragmatic-drag-and-drop` with it. Built for that consumer, the root weighs 244 kB minified; `@slashome/lumen/select` weighs 79 kB, of which 22 kB are the icon set and the rest Lit and Floating UI.

## Decision

- **Every component lives in `src/components/<name>/`**: `<name>.css` if it has styles, `<name>.ts` if it has an element, `<name>.stories.ts`, and `<name>.test.ts` when it has an element. A sub-element that has no meaning alone lives with its parent: `lu-option` in `select/`, `lu-draggable` and `lu-drop-zone` in `drag-area/`. `lu-multi-select` takes its options as data and does not use `lu-option`.
- **The floor is a property of the component, not a folder.** A floor-0 component has only its CSS and its story; a floor-1 component has its element, and its CSS when it renders into the light DOM (`markdown.css`, `mark.css` for `lu-highlight`).
- **Foundations stay outside `components/`**, in `src/foundations/`: the tokens, `base.css`, `light.css`, `utilities.css` and the `lumen.css` aggregate. Helpers shared by elements (`define`, `styles`, `list-navigation`) join `src/lib/`.
- **One entry point per element**: `@slashome/lumen/<name>` imports `src/components/<name>/<name>.ts` and defines that element, its sub-elements and the elements it renders (`lu-icon`). The entries are the component folders that hold a `<name>.ts`; `vite.config.ts` reads them from the file system.
- **The root `@slashome/lumen` stays the aggregate**: it defines every element and re-exports `lib`.
- **`sideEffects` in `package.json` lists only the modules that define an element, and the CSS.** The build keeps one output file per source module (`preserveModules`), so that list names real files instead of hashed chunks. It also lists `src/index.ts` and `src/components/*/*.ts`, because Vite applies the field to the package's own sources and would otherwise drop the bare `import '../icon/icon'` of an element. `src/package.test.ts` fails when an element module is missing from the list or from `exports`.
- **`dist/css/` keeps flat file names**: `scripts/copy-css.js` copies every CSS file of `foundations/` and `components/` there and rewrites the imports of `lumen.css`, so `./css/<name>.css` paths do not change. It fails if two files would share a name.

## Consequences

- A component is one folder to read, move or delete; its story and its test sit next to its code.
- A consumer imports only the elements it uses. `lib`, `react`, `vue` and `testing` are free of side effects, so a bundler drops what it does not use from them.
- The React adapter still defines every element: it wraps all of them.
- `dist/` holds more, smaller files, and a module that starts calling `define()` must be added to `sideEffects`; the test catches the omission.
- The CSS file names are a public API shared by every component: two components cannot both ship a `states.css`.

## Alternatives considered

### Folders per floor, `src/css/` and `src/elements/`

What existed. It makes the floor the first thing a reader sees and scatters a component across four places; promoting a component from floor 0 to floor 1 moves its files.

### `sideEffects: false` with element modules exporting a `define` function

The consumer would call `defineSelect()` itself. Every framework would need that call before first render, and the root aggregate would be the only place where importing is enough: two ways to register, for one benefit already given by the per-element entry.

### Default chunking with `sideEffects` naming the entries only

Shared code goes into hashed chunks such as `select-<hash>.js`, and the entry only re-exports it. A bundler that trusts `sideEffects` then treats the chunk that calls `define()` as pure and drops it.

## Revisit if

An element needs to be split into several modules that each define something, or a consumer's bundler mishandles `sideEffects` patterns.
