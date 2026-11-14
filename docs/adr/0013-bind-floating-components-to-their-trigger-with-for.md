# ADR-0013 — Bind floating components to their trigger with for

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001, ADR-0011, ADR-0012, ADR-0014, `slashome/ariane#R002`, `slashome/ariane#T026`

## Context

`lu-tooltip` took its trigger in its default slot and its text in a `content` attribute; `lu-hover-card` took its trigger in a slot named `trigger` and its content in the default slot. Two models for one need, and both wrapped the trigger: a button inside a tooltip inside a hover card, a tooltip text that could hold no markup, and a pointer hover through a shadow `slot` that synthetic events could not reproduce (ADR-0007).

The platform names a related element by id: `<label for>`, `popovertarget`, and `interestfor`, which opens a popover on hover but ships only in Chrome 142 and later, so it is not Baseline (ADR-0014). A survey on 2026-10-31: Shoelace put the trigger in the default slot; Web Awesome, its successor, left that for a `for="<id>"` attribute on `wa-tooltip` and `wa-popover`, the default slot holding the content; Spectrum keeps `slot="trigger"` on `overlay-trigger` and accepts `trigger="id@click"` on `sp-overlay`; Material Web takes `anchor="id"`. cmc-ui uses a `#trigger` slot.

An IDREF such as `aria-describedby` does not cross a shadow boundary. The reflection that does, `ariaDescribedByElements` and `ariaControlsElements`, is Baseline « newly available » only since 2025-04-04 (`web-features`, `aria-attribute-reflection`, by compat key).

The owner decided on 2026-10-31 (`slashome/ariane#R002`) that floating components name their trigger with `for`.

## Decision

- **`lu-tooltip` and `lu-hover-card` never contain their trigger.** Their default slot is their content: the tooltip's text moves from the `content` attribute to the slot.
- **`for="<id>"` names the trigger**, resolved with `getElementById` in the root that holds the component, the document or a shadow root. The property is `htmlFor`, as on `<label>` and `<output>`. **The `anchor` property** takes the element itself, for a trigger in another root, and wins over `for`.
- **The element is the popover.** It sets `popover="manual"` on itself and floats against the trigger; `lu-tooltip` also sets `role="tooltip"`. Both get an id (`lu-tooltip-<n>`, `lu-hover-card-<n>`) when they have none. The `tooltip` and `card` parts are gone: the element is styled as itself.
- **The component sets the ARIA on its trigger and takes it back.** The tooltip adds its id to the trigger's `aria-describedby`, keeping the ids already there; the hover card sets `aria-controls` and keeps `aria-expanded` in step with whether it shows. When the trigger is in another root, the component sets `ariaDescribedByElements` or `ariaControlsElements` where the browser has them, and nothing where it does not. All of it is removed when the component is disconnected or `for` or `anchor` change.
- **A trigger may come later.** While it binds by id, the component listens to one `MutationObserver` per root, shared by every bound component of that root, on `childList` and the `id` attribute, and resolves its id again on each batch: no polling, and a lookup by id is constant time.
- **The listeners move to the trigger**: pointer and focus in and out, and Escape. The hover card still listens to itself for the pointer and focus on the card.
- **Without `for` or `anchor`**, the element logs a `console.error`, like a missing label (ADR-0012).
- **The state model of ADR-0011 is unchanged**: `open`, a cancelable `lu-open-change`, the sources `trigger`, `panel` and `escape`, and `pinned` on the hover card.
- **React** binds by id: `Tooltip` and `HoverCard` require `htmlFor`, and the trigger carries the id, best made with `useId()`. **Vue** passes `for` as an attribute, `<LuTooltip for="copy">`, or a template ref to `:anchor`.
- The previous model is removed without a deprecation: nothing is published.

## Consequences

- A trigger is any element, anywhere in the root: a cell of a table, an icon button in a toolbar, a button that already has a hover card. Nothing is wrapped, and the tooltip's text can hold markup.
- Pointer hover reaches the trigger itself, so the play functions test it with `userEvent.hover`.
- The trigger needs an id. In React that is a `useId()` the owner has to write; a ref-based API was simpler to read but needs a state round-trip, since a ref is empty on the first render.
- Tab follows the DOM order: a hover card that holds focusable content must come right after its trigger in the markup, which the element description says.
- A tooltip whose trigger is in another shadow root is described only where element reflection exists; elsewhere the trigger still works, without the description.
- A page style that sets `display` on `lu-tooltip` or `lu-hover-card` overrides the popover's hiding, as it would on any element with `popover`.
- Every bound component of a root wakes on each mutation batch of that root while it binds by id. With hundreds of tooltips on a page that mutates often, that is hundreds of `getElementById` per batch.
- Lumen departs from cmc-ui's `#trigger`, on purpose: a decision tried here first may move there later (`slashome/lumen#R001`, private content tree).

## Alternatives considered

### Keep the trigger in a slot, as Shoelace and cmc-ui do

What existed. It wraps the trigger, so a trigger cannot have both a tooltip and a hover card without nesting them, and it splits the two components between the default slot and a named one. Web Awesome, which inherited this model from Shoelace, left it.

### `slot="trigger"` on both

One model instead of two, and cmc-ui's. It still wraps the trigger, and the tooltip's text still needs an attribute or a second slot.

### `interestfor` and `popovertarget`, with no JavaScript

The platform's own binding. `interestfor` ships only in Chrome; on any other browser the tooltip would never open on hover (ADR-0014).

### `aria-description` on the trigger, a copy of the text

What the tooltip did. It is a string, so a tooltip with markup loses it, and the attribute is ARIA 1.3, still a draft; `aria-describedby` to the tooltip itself works everywhere in one root.

### A wrapper inside the shadow root as the popover

What existed. The text then sits in a `display: none` subtree of an element that is not hidden itself, which accessible name computation may skip when it follows `aria-describedby`. Making the element the popover means the node `aria-describedby` points to is the one that is hidden, whose content is then counted.

## Revisit if

`interestfor` becomes Baseline widely available, which would let Lumen drop its listeners for the platform's; or element reflection does, which would let a trigger in another root be described everywhere.
