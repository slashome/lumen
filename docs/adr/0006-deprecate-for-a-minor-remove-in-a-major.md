# ADR-0006 — Deprecate for a minor, remove in a major

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0002, ADR-0005

## Context

Lumen is consumed by Ariane through a link today and will be published on npm. A renamed token, attribute or event breaks a consumer silently: a CSS variable that no longer exists falls back to nothing, an attribute that no longer exists is ignored, a listener on a removed event never fires. Nothing is deprecated yet; the process has to exist before the first rename, not be invented during it.

## Decision

- **A token** takes `$deprecated` in its DTCG JSON, `true` or a sentence that names the replacement. `scripts/token-css.js` writes `Deprecated. <reason>` at the head of the comment of its variable in `tokens.css`, and `pnpm generate` prints the deprecated variables. The Tokens page shows a Deprecated badge with the reason.
- **An attribute or a property** takes `@deprecated <replacement>` in the JSDoc of its `declare`; **an event, a slot, a part or a custom property** takes `@deprecated <replacement>` at the end of its `@fires`, `@slot`, `@csspart` or `@cssprop` line; **an element** takes it in its class JSDoc. The manifest carries it, and the Storybook moves the row to a **Deprecated** category of the props table through an argTypes enhancer, `.storybook/deprecated.ts`.
- **A JavaScript export** of `lib`, `react` or `vue` takes `@deprecated` in its JSDoc, which TypeScript shows to the consumer.
- **A deprecation lives at least one minor version before its removal, and the removal is a major version.** It names its replacement, and the replacement ships in the same version as the deprecation.
- The mechanism is proven by tests on fixtures (`scripts/token-css.test.js`, `scripts/manifest-plugins.test.js`, `stories/token-list.test.ts`, `.storybook/deprecated.test.ts`), not by a deprecation published for show.

## Consequences

- A consumer sees a deprecation in three places: the token comment, the props table and its editor.
- A rename costs two releases instead of one, and the old and new names coexist for at least one minor.
- The Deprecated category covers the main component of a page; a subcomponent tab (`lu-option` under Select) shows the reason in the description only if the enhancer is extended to it.
- A token is deprecated where it is described: a dark override does not repeat `$deprecated`.

## Alternatives considered

### Remove in the next minor, before 1.0

Semver allows breaking changes in `0.x`, but Ariane already depends on Lumen and would break on an ordinary update.

### A `deprecated.json` list kept next to the code

A second place to keep in sync with the code it describes, which the analyzer and Style Dictionary do not read.

## Revisit if

Lumen gains consumers outside slashome who need a longer window, or a deprecation has to ship as a runtime warning.
