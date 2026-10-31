# Contributing to Lumen

Rules, not a tutorial. Each one points to the decision that sets it, in [`docs/adr`](docs/adr). The shared vocabulary of names, sizes, variants and events is on the Prop conventions page of the Storybook.

## Branches

- Work on `develop`: commit and push there, or open a pull request into it. `main` only receives merges of `develop`, each one a release, and the `v*` tag is put on `main`. Never push work to `main`. ([ADR-0010](docs/adr/0010-integrate-on-develop-publish-from-main.md))

## Components

- **One folder per component**, `src/components/<name>/`: `<name>.css` if it has styles, `<name>.ts` if it is a custom element, `<name>.stories.ts`, and `<name>.test.ts` for an element. A sub-element with no meaning alone lives with its parent. Foundations stay in `src/foundations/`, helpers shared by elements in `src/lib/`. ([ADR-0004](docs/adr/0004-one-folder-and-one-entry-point-per-component.md))
- **One entry point per element**: a module that defines an element is listed in `exports` and in `sideEffects` of `package.json`. `src/package.test.ts` fails on an omission. ([ADR-0004](docs/adr/0004-one-folder-and-one-entry-point-per-component.md))
- **The platform and the ARIA pattern first.** Check what native HTML (`<dialog>`, the popover API, `<select>`, a checkbox with `role="switch"`) and the WAI-ARIA pattern already give before writing a component. A component without state is a CSS class on native HTML; only state justifies a custom element. ([ADR-0001](docs/adr/0001-split-the-system-into-a-css-floor-and-a-lit-floor.md))
- **Baseline « widely available », never a polyfill.** A native feature the code depends on is Baseline « widely available » (in Chrome, Edge, Firefox and Safari for at least 30 months), checked per compat key in `web-features`. A newer one enters only as a progressive enhancement, feature-detected or behind `@supports`, with a fallback that stays usable; a pull request that adds one says so. No polyfill, ever. ([ADR-0014](docs/adr/0014-target-baseline-widely-available-never-polyfill.md))
- **A floating component never wraps its trigger.** It holds its content in its default slot and names its trigger with `for="<id>"`, or takes it in an `anchor` property, and sets the trigger's ARIA itself. ([ADR-0013](docs/adr/0013-bind-floating-components-to-their-trigger-with-for.md))
- **Everything public is prefixed `lu-`**: elements, classes, custom properties, events (`CustomEvent`, bubbling and composed) and cascade layers. ([ADR-0001](docs/adr/0001-split-the-system-into-a-css-floor-and-a-lit-floor.md))
- **No color and no primitive token in a component.** A component uses only semantic `--lu-*` tokens. A missing meaning is a new semantic token in `tokens/semantic`, with a `$description` saying what it is for and where not to use it; the build fails without one. ([ADR-0002](docs/adr/0002-build-tokens-with-style-dictionary.md))
- **No text in the published code.** Every label, visible or accessible, comes from the application: an attribute of the instance, or a key of `LumenMessages` registered with `registerLumenMessages()`. The accessible name of a control (`label` on `lu-select`, `lu-multi-select`, `lu-segmented`, `lu-tabs`) is required per instance: `@required` on its `declare`, which makes it required in the React and Vue types, and a `console.error` when it is missing. Without a label the element logs `console.error` and renders nothing in its place; `src/labels.test.ts` mounts every element without labels and checks each one is reported. Demonstration texts live in the Storybook only, `stories/messages.ts`. ([ADR-0012](docs/adr/0012-lumen-ships-no-text.md))
- **A `lu-*` event is always public**, fired for the application and documented in `@fires`. Elements of Lumen talk to each other by calling methods, kept out of the manifest with `@internal`. ([ADR-0012](docs/adr/0012-lumen-ships-no-text.md))
- **An element changes the state the user changes**, after a cancelable `lu-<noun>-change` that carries the new value and its `source`; a consumer controls it by cancelling the event and setting the property. ([ADR-0011](docs/adr/0011-change-state-after-a-cancelable-event.md))
- **Icons by semantic name**, mapped in `icons/lumen.json`; nothing is fetched at run time. ([ADR-0003](docs/adr/0003-embed-icons-at-build-time-under-semantic-names.md))

## Code and documentation

- **No comments in code.** The one exception is the public JSDoc of a custom element: class block (`@summary`, `@tag`, `@slot`, `@csspart`, `@cssprop`, `@fires`) and one line on the `declare` of each public property, with `@required` when the element cannot work without it ([ADR-0012](docs/adr/0012-lumen-ships-no-text.md)). It feeds `custom-elements.json`, the Storybook props tables and the React and Vue types; `src/manifest.test.ts` fails when an item has no description. ([ADR-0005](docs/adr/0005-document-the-api-in-jsdoc-and-read-it-from-the-manifest.md))
- **Every story declares `component: 'lu-<name>'` and `tags: ['autodocs']`**, and its docs subtitle says how the component is used: `CSS class · no JavaScript`, or `Custom element · import '@slashome/lumen/<name>'`. ([ADR-0005](docs/adr/0005-document-the-api-in-jsdoc-and-read-it-from-the-manifest.md), [ADR-0009](docs/adr/0009-describe-components-by-usage-not-by-floor.md))
- **Public vocabulary**: Storybook, README, CHANGELOG and changesets say « CSS class » and « custom element », never « floor », « Lit » or « light DOM ». « Floor » survives only in the ADRs. ([ADR-0009](docs/adr/0009-describe-components-by-usage-not-by-floor.md))

## Tests

- **A jsdom unit test per element**, `<name>.test.ts`, run by `pnpm test`. ([ADR-0004](docs/adr/0004-one-folder-and-one-entry-point-per-component.md))
- **A `play` function on the story of every interactive component**, checking behaviour: opening and closing, focus, keyboard, the `lu-*` events fired. It uses `storybook/test` only; shared helpers are in `stories/play.ts`. ([ADR-0007](docs/adr/0007-run-every-story-as-a-browser-test.md))
- **Accessibility blocks**: an axe violation fails the story's test. A story that waives a rule does it in its own `parameters.a11y`, rule by rule, with the reason. ([ADR-0007](docs/adr/0007-run-every-story-as-a-browser-test.md))

## Changes to the public API

- **A changeset for every change to `src/`, `tokens/` or `icons/`**: `pnpm changeset`, the semver level and one line written for a consumer; `pnpm changeset --empty` when nothing ships. CI fails a pull request into `develop`, or a push to `develop`, without one. ([ADR-0008](docs/adr/0008-write-the-changelog-from-changesets.md), [ADR-0010](docs/adr/0010-integrate-on-develop-publish-from-main.md))
- **Deprecate for a minor, remove in a major.** A token takes `$deprecated`; an attribute, property, element or export takes `@deprecated` in its JSDoc; an event, slot, part or custom property takes `@deprecated` at the end of its JSDoc line. The deprecation names its replacement, which ships in the same version. ([ADR-0006](docs/adr/0006-deprecate-for-a-minor-remove-in-a-major.md))

## Before pushing

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm test:browser && pnpm build && pnpm build-storybook
```

All of it, green. `pnpm test:browser` needs Chromium once: `pnpm exec playwright install chromium`.

## Decisions

A decision that a rule above does not cover gets an ADR in `docs/adr/`, numbered after the last one, in the format of [`0000-template.md`](docs/adr/0000-template.md).
