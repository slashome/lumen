# ADR-0015 — Fall back from relative colors to the default theme, computed at build time

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0002, ADR-0014, `slashome/lumen#D001` (principle 7), `slashome/lumen#T034`

## Context

ADR-0002 derives shades from the run-time theme (`--lu-theme-primary`, `--lu-theme-secondary`) with relative color syntax, `oklch(from …)`. ADR-0014 found that this syntax is only « newly available » (`relative-color`, since 2024-09-16, `web-features` 3.44.0) and that Lumen had no fallback: `--lu-color-primary-foreground` and `--lu-color-highlight` in light, `--lu-color-primary`, `--lu-color-ring`, `--lu-color-accent` and `--lu-color-highlight` in dark.

A custom property is not validated when it is parsed: `--lu-color-primary: oklch(from …)` is a valid declaration in every browser, and fails only where it is used, as `background: var(--lu-color-primary)`, which becomes `unset`. So the usual CSS fallback, a plain value declared just before the newer one, does nothing for a token: the second declaration wins in every browser. Registering the property with `@property` and `syntax: '<color>'` would make an older browser drop it at parse time, but `registered-custom-properties` is itself only « newly available » (2024-07-09).

The rest of the color functions are widely available: `oklch()` and `oklab()` (2025-11-09), `color-mix()` (2025-11-09), `min()`, `max()`, `clamp()` (2023-01-28), `@supports` (2018-03-30), cascade layers (2024-09-14).

## Decision

- `tokens.css` keeps the relative colors as they are, then repeats, inside the `lu.tokens` layer, the three appearance blocks (`:root`, the dark attribute, the dark media query) under `@supports not (color: oklch(from red l c h))`. Later in source order with the same selectors, a fallback block replaces the relative values in a browser that does not support them, and is ignored by one that does.
- A fallback block holds every token whose value is a relative color or refers to a theme token directly, in that appearance: in light `primary`, `primary-foreground`, `ring`, `accent`, `highlight`; in dark the same five, `primary-foreground` included because it derives from the dark `primary`. Tokens built on them with `color-mix()`, such as `halo`, follow through `var()`.
- The values are computed at build time from the default theme of `tokens/semantic/base/theme.json`: `scripts/relative-color.js` reads the origin color with `colorjs.io` and evaluates the channel expressions (`l`, `c`, `h`, `alpha`, numbers, `+ - * /`, parentheses, `min()`, `max()`, `clamp()`, `calc()`). An expression outside that set fails the build rather than ship a guess.
- So in an older browser the theme set at run time is ignored for those tokens, in light as well as dark, and the interface draws with the default colors. A current browser keeps the theme fully dynamic.
- `scripts/tokens.test.js` checks that every relative color of the built `tokens.css` has a fallback in each appearance; the story « Foundations/Tokens/Relative color fallback » applies the fallback blocks in Chromium, checks that no relative value is left, that each fallback matches what Chromium computes for the default theme, and that text on the fallback colors reaches 4.5:1.

## Consequences

- Dark mode no longer loses its primary fills in a browser older than September 2024; text on the primary and on the highlight stays at WCAG AA in both appearances.
- An application that sets its own theme looks like Lumen's default theme in those browsers. Pinning the theme is the price of legible text: `primary-foreground` cannot be computed at build time for a theme only known at run time, and white text on an unknown light theme can be unreadable.
- `colorjs.io`, already in the tree through Style Dictionary, becomes a direct development dependency.
- A new relative color in a token gets its fallback for free; a new channel function that the evaluator does not know stops the build until it is taught.

## Alternatives considered

### A plain value declared before the relative one

The fallback idiom for properties, and inert for custom properties: both declarations are valid, the relative one wins everywhere, and the older browser still fails at the point of use.

### `@property` with `syntax: '<color>'`

Would make the older browser drop the relative value and keep the earlier one, but registered custom properties are only « newly available », so it trades one unsupported feature for another.

### Fallbacks written by hand in the token JSON

No new code, and values that drift from the primitives the day one of them changes; the build already knows how to resolve them.

### Fall back only the relative tokens and keep the theme for the others

Keeps the application's color in light mode, but pairs a run-time primary with a foreground computed for the default one: white text on a yellow theme fails the contrast that the fallback exists to keep.

## Revisit if

Relative color syntax becomes « widely available » (from 2027-03-16 under the current definition), at which point the fallback blocks and `scripts/relative-color.js` can go; or the tokens start using a color function the evaluator cannot compute at build time.
