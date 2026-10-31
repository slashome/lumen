# ADR-0014 — Target Baseline widely available, never polyfill

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001, ADR-0002, ADR-0013, `slashome/ariane#R002`, `slashome/lumen#D001` (principle 7)

## Context

Lumen prefers HTML and CSS to JavaScript: `<dialog>`, the popover API, native controls, `<label for>`. The counterpart is that a recent native feature is not in every browser a user has. Two ways out: polyfills, or a floor below which Lumen does not go.

The owner wants Lumen to be able to become the design system of ATLAS, so usable by everyone, and decided on 2026-10-31 (`slashome/lumen#D001`, principle 7) that Lumen uses a native feature only once it is Baseline « widely available », that a newer one enters only as a progressive enhancement, and that Lumen never ships a polyfill.

Baseline is defined by the W3C WebDX group and published as the `web-features` package and on webstatus.dev: a feature is « newly available » once it ships in the current Chrome, Edge, Firefox and Safari, desktop and mobile, and « widely available » 30 months later. A feature groups several compat keys, which can have their own dates: `popover` as a whole is « newly available » since 2025-01-27 because of the `HTMLElement.popover` property, while the `popover` attribute, `showPopover()`, `hidePopover()`, `:popover-open` and the `toggle` event are « widely available » since 2026-10-16 (`npm pack web-features@3.44.0`, `data.json`, `features.popover.status.by_compat_key`).

## Decision

- **A native feature that Lumen depends on is Baseline « widely available »**, checked compat key by compat key in `web-features` for what the code actually calls.
- **A newer feature enters only as a progressive enhancement**: feature-detected in JavaScript, or behind `@supports` in CSS, with a fallback that stays usable, which means the user can still read and act, even if the result is plainer.
- **Never a polyfill.** A polyfill is JavaScript imitating HTML, the opposite of the principle, and a dependency that outlives its reason. The DOM shims of `@slashome/lumen/testing` are not polyfills: they stand in for what jsdom lacks in unit tests, and no element loads them.
- **Tests may use newer features** that the shipped code does not: the play functions call `dialog.requestClose()` (« newly available » since 2025-05-27), which runs in the Chromium of the browser tests only.
- **A new feature in a pull request names its Baseline status** in the description when it is not « widely available », with its fallback.

### Audit on 2026-10-31

What the shipped code uses and is not « widely available », from `web-features` 3.44.0:

| Feature | Status | Where | Fallback |
| --- | --- | --- | --- |
| Relative color syntax, `oklch(from …)` | newly available since 2024-09-16 | `tokens/semantic`: `--lu-color-primary-foreground` and `--lu-color-highlight` in light, `--lu-color-primary`, `--lu-color-ring`, `--lu-color-accent` and `--lu-color-highlight` in dark | None. An older browser drops the value at computed time: the properties that use it fall back to `unset`, so a primary fill loses its background in dark mode. To fix in the token build, with `@supports`. |
| `ariaDescribedByElements`, `ariaControlsElements` | newly available since 2025-04-04 | `src/lib/trigger.ts`, for a trigger in another shadow root than its tooltip or hover card (ADR-0013) | Feature-detected: without them the trigger works, without the description or `aria-controls`. Usable. |

Widely available, and close to the line: the popover attribute and its methods, `:popover-open` and `toggle` (2026-10-16), CSS nesting (2026-06-11), `:has()` (2026-06-19), `mask-image` (2026-06-07), `ToggleEvent` (2026-05-21), `oklch()`, `oklab` and `color-mix()` (2025-11-09). `display: contents` is widely available, except on focusable elements, where Lumen does not use it.

## Consequences

- An application built on Lumen works in every browser released in the last two and a half years, ATLAS's users included.
- Lumen waits for the platform: a feature that would remove JavaScript, such as `interestfor` for the hover card, is used only once it is « widely available », or behind a fallback that keeps the JavaScript.
- Widening later to newer features breaks nothing; reaching older browsers after the fact would cost a rewrite.
- The relative colors of the tokens break the rule today and need an `@supports` fallback in the token build; until then, dark mode on a browser older than September 2024 draws primary fills without a background.
- The popover API crossed the line only on 2026-10-16: before this ADR, `lu-select`, `lu-multi-select`, `lu-toaster`, `lu-tooltip` and `lu-hover-card` depended on a feature that was not yet « widely available ».

## Alternatives considered

### Polyfills for what is missing

The popover and dialog polyfills exist. Each is JavaScript that imitates the platform, loaded by every user to help a few, and kept in step with a spec that moves; Lumen would ship the reimplementation its principles reject.

### Target evergreen browsers only

The simplest rule, and what most design systems say. It excludes users on managed or older devices, the ones ATLAS must serve.

### « Newly available » as the floor

Twice as many features, and a floor that moves past the browsers of anyone who does not update within weeks.

## Revisit if

Baseline changes its definition or its delay; or a consumer must support a browser older than « widely available », which would call for a floor of its own rather than polyfills.
