# Lumen

The design system of slashome: design tokens, CSS for what has no state, and Lit custom elements for what has one. One implementation for React, Vue, Svelte and plain HTML.

**Storybook:** https://slashome.github.io/lumen/

## Install

```sh
pnpm add @slashome/lumen
```

```js
import '@slashome/lumen/lumen.css'
import '@slashome/lumen'
```

`lumen.css` holds the tokens and floor 0; `tokens.css` alone holds the tokens, and `css/<name>.css` one component.

`@slashome/lumen` defines every element. To ship only the ones a page uses, import them one by one; each defines its element and the ones it renders:

```js
import '@slashome/lumen/select'
import '@slashome/lumen/dialog'
```

The entries are `icon`, `dialog`, `sheet`, `confirm-dialog`, `tooltip`, `hover-card`, `select` (with `lu-option`), `multi-select`, `segmented`, `toaster`, `markdown`, `highlight` and `drag-area` (with `lu-draggable` and `lu-drop-zone`).

## Use

| Where | How |
| --- | --- |
| Plain HTML, Svelte | `<button class="lu-button">`, `<lu-select>` |
| Vue | the same elements; tell the compiler with `isLumenElement` from `@slashome/lumen/vue` |
| React | `@slashome/lumen/react`: `Button`, `Dialog`, `Select`, `DataTable`, `toast`… |

Theme with two variables on `:root`: `--lu-theme-primary` and `--lu-theme-secondary`. Dark mode follows `data-appearance="dark"` on the root, or the system.

## Develop

```sh
pnpm install
pnpm storybook
pnpm test
pnpm exec playwright install chromium
pnpm test:browser
pnpm lint
pnpm typecheck
pnpm build
```

Each component lives in `src/components/<name>/` with its CSS, its element if it has state, its story and its test. An element documents its public API in JSDoc (`@summary`, `@slot`, `@csspart`, `@cssprop`, `@fires`, and every public attribute and property); `pnpm generate` reads it into `custom-elements.json`, which feeds the Storybook props tables and the React and Vue element types. `pnpm test` runs the unit tests in jsdom; `pnpm test:browser` runs every story in Chromium, with its `play` function and an accessibility check that fails on any violation. Tokens, base styles and utilities live in `src/foundations/`. Decisions live in [`docs/adr`](docs/adr).

## Release

Bump `version` in `package.json`, merge, then push a tag `v<version>`: the Release workflow publishes `@slashome/lumen` on npm. Storybook is deployed to GitHub Pages on every push to `main`.

## Deprecation

Nothing public disappears without warning. A token takes `$deprecated` in its JSON; an attribute, a property or an export takes `@deprecated` in its JSDoc; an event, a slot, a part or a custom property takes `@deprecated` at the end of its `@fires`, `@slot`, `@csspart` or `@cssprop` line. The build reports deprecated tokens, `custom-elements.json` carries the rest, and the Storybook shows both.

**A deprecation lives at least one minor version before its removal, and the removal is a major version.** It names its replacement. The details are on the Prop conventions page of the Storybook.

## Licence

MIT
