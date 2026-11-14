# ADR-0009 — Describe components by usage, not by floor

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001, ADR-0004, ADR-0005

## Context

ADR-0001 splits Lumen into a CSS floor and a Lit floor, and the documentation carried that split to the consumer: every page said « Floor 0 — CSS » or « Floor 1 — Lit » under its title, and the introduction was titled « Two floors ». The owner judged it implementation vocabulary with nothing to offer a consumer.

What the consumer does need is how to use a component: put a class on native HTML, or import a tag. A survey of Bootstrap, Spectrum, Lightning, Carbon, Primer, GOV.UK, Web Awesome, Material Web, Fluent, Pico and daisyUI on 2026-10-31 found no floor or layer badge anywhere: they show the usage in the code sample, in an import section, or in one sentence about behaviour (« uses JavaScript », « does not include JavaScript »), and sort their navigation by use.

## Decision

- Consumer documentation (Storybook, README, CHANGELOG, changesets) never says « floor », « Lit » or « light DOM ».
- Each component page says how it is used, in its subtitle: `CSS class · no JavaScript`, or `Custom element · import '@slashome/lumen/<name>'`.
- The introduction explains the two ways to use a component and lists the custom elements.
- « Floor » stays a contributor term, in ADR-0001 and ADR-0004, which are not rewritten.

## Consequences

A consumer reads what to do, not how Lumen is built. A component that gains state changes its subtitle, not its place in the navigation. Contributors still meet the word « floor » in the ADRs and must map it to « CSS class » and « custom element ».

## Alternatives considered

### Keep a floor badge

What existed. It names the stack, not the usage, and no surveyed system does it.

### Drop the distinction entirely

It hides the one thing a consumer must know before writing code: whether a component needs an import.

## Revisit if

A component exists both as a class and as an element, so that a single line can no longer say how it is used.
