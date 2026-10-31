# Lumen

The design system of slashome: design tokens, CSS classes for what has no state, and custom elements for what has one. One implementation for React, Vue, Svelte and plain HTML.

**Storybook:** https://slashome.github.io/lumen/

## Install

```sh
pnpm add @slashome/lumen
```

```js
import '@slashome/lumen/lumen.css'
import '@slashome/lumen'
```

`lumen.css` holds the tokens and every CSS class; `tokens.css` alone holds the tokens, and `css/<name>.css` one component.

`@slashome/lumen` defines every element. To ship only the ones a page uses, import them one by one; each defines its element and the ones it renders:

```js
import '@slashome/lumen/select'
import '@slashome/lumen/dialog'
```

The entries are `icon`, `dialog`, `sheet`, `confirm-dialog`, `tooltip`, `hover-card`, `select` (with `lu-option`), `multi-select`, `segmented`, `tabs`, `toaster`, `markdown`, `highlight` and `drag-area` (with `lu-draggable` and `lu-drop-zone`).

## Use

| Where | How |
| --- | --- |
| Plain HTML, Svelte | `<button class="lu-button">`, `<lu-select>` |
| Vue | the same elements; tell the compiler with `isLumenElement` from `@slashome/lumen/vue`, which also exports `LuDialog`, `LuSelect`… for `v-model:open` and `v-model:value` |
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
pnpm build-storybook
```

Each component lives in `src/components/<name>/`: its CSS, its element if it has state, its story, and its unit test when it has an element. An element documents its public API in JSDoc (`@summary`, `@slot`, `@csspart`, `@cssprop`, `@fires`, and every public attribute and property); `pnpm generate` reads it into `custom-elements.json`, which feeds the Storybook props tables and the React and Vue element types. `pnpm test` runs the unit tests in jsdom; `pnpm test:browser` runs every story in Chromium, with its `play` function and an accessibility check that fails on any violation. Token sources live in `tokens/` and icon names in `icons/lumen.json`; base styles, utilities and the generated `tokens.css` live in `src/foundations/`, helpers shared by elements in `src/lib/`. The rules for contributing are in [`CONTRIBUTING.md`](CONTRIBUTING.md), the decisions behind them in [`docs/adr`](docs/adr).

## Releasing

`develop` integrates, `main` publishes (ADR-0010). Work is committed and pushed on `develop`; `main` only receives merges of `develop`, each one a release.

Every change to `src/`, `tokens/` or `icons/` adds a changeset: run `pnpm changeset`, pick the semver level, and write one line for someone who uses Lumen. A change that ships nothing takes `pnpm changeset --empty`. CI fails a pull request into `develop`, or a push to `develop`, that touches those folders without a new changeset.

The owner releases from an up-to-date `develop`, with nothing unpushed:

```sh
git switch develop && git pull
pnpm changeset version
git commit -am "Release v$(node -p "require('./package.json').version")"
git push origin develop
git switch main && git pull
git merge --no-ff develop
git tag "v$(node -p "require('./package.json').version")"
git push origin main --follow-tags
git switch develop
```

`pnpm changeset version` consumes the pending changesets into `CHANGELOG.md` and bumps `version` in `package.json`; check both before committing. Push the release commit on its own: pushed with unreleased changes, it deletes the changesets those changes added and CI fails. The tag `v<version>` triggers the Release workflow: it checks that the tagged commit is on `main` and that the tag matches `package.json`, publishes `@slashome/lumen` on npm with provenance, and creates a GitHub Release whose notes are that version's section of `CHANGELOG.md`. The changelog also ships in the package and shows in the Storybook under Foundations. Storybook is deployed to GitHub Pages on every push to `main`, so it shows what is published. See ADR-0008 and ADR-0010.

## Deprecation

Nothing public disappears without warning. A token takes `$deprecated` in its JSON; an attribute, a property or an export takes `@deprecated` in its JSDoc; an event, a slot, a part or a custom property takes `@deprecated` at the end of its `@fires`, `@slot`, `@csspart` or `@cssprop` line. The build reports deprecated tokens, `custom-elements.json` carries the rest, and the Storybook shows both.

**A deprecation lives at least one minor version before its removal, and the removal is a major version.** It names its replacement. The details are on the Prop conventions page of the Storybook.

## Licence

MIT
