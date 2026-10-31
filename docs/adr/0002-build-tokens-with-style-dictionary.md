# ADR-0002 — Build the tokens with Style Dictionary, theme at run time

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001

## Context

Ariane sets two colors at run time (`--theme-primary`, `--theme-secondary`) and derives every shade from them in CSS, with relative color syntax (`oklch(from …)`) and `color-mix()`. Its dark mode follows `data-appearance` on the root. The cmc-ui precedent shows the failure to avoid: a constants layer full and a semantic layer empty, so colors end up as props.

## Decision

- Tokens are JSON in the DTCG format: `tokens/primitive` (scales) and `tokens/semantic/light` and `tokens/semantic/dark` (meaning). `scripts/tokens.js` builds them with Style Dictionary into one `tokens.css`, keeping references as `var()` so derived values follow the run-time theme.
- Variables are named `--lumen-*`. The theme is `--lumen-theme-primary` and `--lumen-theme-secondary`.
- Dark tokens apply under `:root[data-appearance='dark']`, and under `prefers-color-scheme: dark` when the attribute is absent.
- One family of tokens carries the light effect of an action (`--lumen-motion-light-*`): changing its duration, curve or intensity changes it everywhere.

## Consequences

Color values pass through Style Dictionary untouched: no color transform runs, because relative color syntax is not a color it can parse. A token whose value is not valid CSS is caught only in the browser.

## Alternatives considered

### Terrazzo

Same DTCG format and stricter about the specification, with a smaller ecosystem; nothing here needs what it adds.

### Plain CSS variables written by hand

No single source to generate other outputs from (a Tailwind theme, native platforms) when a consumer needs one.

## Revisit if

A consumer needs tokens on a platform CSS cannot reach, or the DTCG format stabilises in a way Style Dictionary does not follow.
