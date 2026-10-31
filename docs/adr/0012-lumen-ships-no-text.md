# ADR-0012 — Lumen ships no text

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001, ADR-0005, ADR-0011, `slashome/ariane#T024`

## Context

Lumen drew English text of its own: `close-label="Close"` on `lu-dialog`, `lu-sheet` and `lu-toaster`, `aria-label="Notifications"` on the toaster's region, `Confirm` and `Cancel` on `lu-confirm-dialog`, `Clear` on `lu-multi-select`, `aria-roledescription="draggable"` on `lu-draggable`, five keyboard announcements in `lu-drag-area` (`Picked up …`, `Over …`, `Dropped on …`, `Dropped.`, `Move cancelled.`), and `Loading…` and `Cancel` as defaults of the React adapter. An application in French got English for every label it forgot, and nothing told it it had forgotten one. `lu-confirm-dialog` also inherited `close-label` from `lu-dialog`, documented, for a button it does not have.

The owner decided on 2026-10-31 that the design system contains no text meant for the user, visible or accessible, and that only the Storybook holds demonstration text. The systems surveyed (Web Awesome, PrimeVue, GOV.UK Frontend) keep a global registry of labels, but all ship English defaults; unstyled primitives such as Radix come closest to shipping none, and report a missing name with a console error.

`lu-draggable` reached its `lu-drag-area` through `lu-pickup`, a bubbling, composed event. It went on up to the document, so it became public: documented, typed (`PickupDetail`), exposed as `onPickup` in React and `onLuPickup` in Vue, with no use for an application. Nothing is published on npm yet and no repository listens to it.

## Decision

- **No text in the published code.** Every label comes from the application.
- **A registry of generic labels**, `src/lib/messages.ts`, exported by `@slashome/lumen` and `@slashome/lumen/lib`: `registerLumenMessages(lang, messages)`, the `LumenMessages` interface with one required key per generic label, and `lumenMessageKeys`. A text with a parameter is a function (`dragPickedUp: ({ item }) => string`), so the application plugs in its own `t()`; there is no message syntax to parse.
- **The registry lives on `globalThis[Symbol.for('@slashome/lumen/messages')]`**, with its listeners and its observer, so that two copies of Lumen in one page share it.
- **The language** is the `lang` of the element or of its nearest ancestor, else `<html lang>`; a regional tag falls back to its primary language (`fr-CA` to `fr`). One `MutationObserver` watches `lang` under `<html>`; a change, or a new registration, calls `requestUpdate()` on every connected element that uses the registry.
- **An attribute of the instance wins over the registry**: `close-label`, `cancel-label`, `clear-label`, the `label` of `lu-toaster`, the `role-description` of `lu-draggable`. A parameterised announcement has no attribute.
- **A label that names one action is required per instance and has no key**: `confirm-label` on `lu-confirm-dialog`, required in the React types.
- **Without a label**, the element logs `console.error` naming the element, the key or the attribute, and the resolved language, once per element and language, and renders nothing in place of the text; a button left without a name fails axe in its story.
- **`lu-confirm-dialog` no longer extends `lu-dialog`.** Both extend an untagged base, `LumenModal`, which the manifest drops; only `lu-dialog` and `lu-sheet` have `close-label`.
- **React** calls `registerLumenMessages()` once at start-up, without a provider. **Vue** gets a plugin, `app.use(lumen, { messages: { fr, en } })`, from `@slashome/lumen/vue`.
- **A `lu-*` event is always public.** Elements of Lumen call each other's methods: `lu-draggable` calls `pickUp()` on its closest `lu-drag-area`, a member tagged `@internal`, which keeps it out of `custom-elements.json`. `lu-pickup`, `PickupDetail`, `onPickup` and `onLuPickup` are removed without a deprecation.

## Consequences

- An application that forgets a label sees it in the console and in its accessibility tests, in its own language, instead of shipping English.
- Every application must register messages before it renders a dialog, a toaster, a multi-select or a drag area, and give `confirm-label` to every confirm dialog: a breaking change for Ariane, which relied on the English defaults.
- Removing `lu-pickup` and the defaults skips ADR-0006's deprecation window: nothing is published yet, and a deprecated English default would still be English text.
- A text added to an element is a new key of `LumenMessages`, so a breaking change for every application's messages, which the compiler points to.
- `lu-draggable` reaches its area with `closest()`, which does not cross a shadow root: a draggable must sit in the light DOM of its `lu-drag-area`, as it already had to for the drop zones.
- The Vue element types stay `Partial`: `confirm-label` is required in the React types only.

## Alternatives considered

### Keep English defaults behind the attributes

What existed, and what Web Awesome and PrimeVue do. An application in another language learns about a forgotten label from a user.

### A provider or context per framework

React context or Vue `provide` reach components, not custom elements rendered by plain HTML or another framework; the registry has to live outside any framework anyway.

### ICU message strings in the registry

The application already has its own translation function; a string syntax would make Lumen parse plural rules it does not need.

### Keep `lu-pickup` and mark it internal

The event still reaches the document, where any listener sees it; an `@internal` method is visible to nobody but Lumen.

## Revisit if

An element needs a text that depends on data the application cannot know in advance, so that a function key is not enough; or a consumer needs Lumen in a shadow tree whose `lang` the observer cannot see.
