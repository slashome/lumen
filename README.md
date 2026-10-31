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

`lumen.css` holds the tokens and floor 0; `tokens.css` alone holds the tokens.

## Use

| Where | How |
| --- | --- |
| Plain HTML, Svelte | `<button class="lumen-button">`, `<lumen-select>` |
| Vue | the same elements; tell the compiler with `isLumenElement` from `@slashome/lumen/vue` |
| React | `@slashome/lumen/react`: `Button`, `Dialog`, `Select`, `DataTable`, `toast`… |

Theme with two variables on `:root`: `--lumen-theme-primary` and `--lumen-theme-secondary`. Dark mode follows `data-appearance="dark"` on the root, or the system.

## Develop

```sh
pnpm install
pnpm storybook
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Decisions live in [`docs/adr`](docs/adr).

## Release

Bump `version` in `package.json`, merge, then push a tag `v<version>`: the Release workflow publishes `@slashome/lumen` on npm. Storybook is deployed to GitHub Pages on every push to `main`.

## Licence

MIT
