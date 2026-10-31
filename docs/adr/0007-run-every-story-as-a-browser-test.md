# ADR-0007 — Run every story as a browser test

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001, ADR-0004

## Context

The tests ran in jsdom only. jsdom has neither `<dialog>`'s modality nor the popover API, so `src/testing` shims both, and the overlays (tooltip, hover card, sheet, confirm dialog, toaster, drag and drop) had no test at all. The preview declared `a11y: { test: 'error' }`, but nothing ran the stories, so no accessibility violation ever failed anything.

The Release workflow runs `pnpm test` on a runner that has no browser installed, and it is not part of this change.

## Decision

- **`@storybook/addon-vitest` turns every story into a test**, run by Vitest in Playwright's headless Chromium. `vite.config.ts` declares two Vitest projects: `unit`, the jsdom tests as before, and `storybook`, the stories.
- **Two scripts.** `pnpm test` runs `unit` and needs no browser; `pnpm test:browser` runs `storybook`. The CI workflow installs Chromium, cached by Playwright version, and runs both.
- **Accessibility blocks.** `a11y: { test: 'error' }` in the preview makes an axe violation fail the story's test, after its `play` function. A story that must waive a rule does it in its own `parameters.a11y`, rule by rule, with the reason.
- **Every interactive element has a `play` function on its story** that checks behaviour, not rendering: opening and closing, where the focus goes, the keyboard, and the `lu-*` events it fires. `stories/play.ts` holds the shared helpers: recording a `lu-*` event, reaching into a shadow root, and the modal scenario shared by `lu-dialog` and `lu-sheet`.
- **`play` functions use `storybook/test` only**, so they run in the Storybook UI as well as in Vitest. Its `userEvent` dispatches synthetic events, so where the browser reacts only to trusted input the play function uses the matching DOM call: `dialog.requestClose()` for Escape on a native dialog, `element.focus()` to reach a button inside a shadow root.

## Consequences

- The overlays are tested in the engine that runs them, without shims, and the interaction panel of the Storybook replays each scenario step by step.
- A component change that breaks focus or the keyboard fails CI. Writing these play functions found two bugs: the Space that picked up a `lu-draggable` also dropped it in place, and a dialog reopened right after closing closed itself again on the late `close` event.
- The CI job downloads Chromium once per Playwright version and takes a few seconds more.
- The Release workflow runs the jsdom tests only; the browser tests gate the pull request instead.
- Escape on a popover (`lu-select`, `lu-multi-select`) and pointer hover through a shadow `slot` (`lu-hover-card`'s trigger) are not reproduced by synthetic events and stay untested.

## Alternatives considered

### Vitest browser mode's own `userEvent`, which drives Playwright with trusted input

It would test Escape and hover exactly. It exists only inside Vitest, so a `play` function using it breaks in the Storybook UI, where the same scenario is meant to be replayed.

### One `pnpm test` running both projects

Simpler to type, but `pnpm test` in the Release workflow would fail for want of a browser, and changing that workflow is out of scope.

### Storybook's test runner on a built Storybook

The older path: it needs a served Storybook and a second runner beside Vitest, where the addon reuses the Vite config and the Vitest already in place.

## Revisit if

`storybook/test` gains trusted input, which would let the play functions cover Escape on popovers and hover through slots, or the Release workflow installs a browser, which would let `pnpm test` run both projects.
