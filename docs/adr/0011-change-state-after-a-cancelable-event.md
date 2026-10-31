# ADR-0011 — Change state after a cancelable event, control by cancelling it

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001, ADR-0005, ADR-0006, `slashome/ariane#T024`

## Context

Lumen had two models for a state the user changes. The form elements (`lu-select`, `lu-segmented`, `lu-multi-select`, `lu-tabs`) fired a cancelable `lu-*-change` and then set their own value. The modal overlays (`lu-dialog`, `lu-sheet`, `lu-confirm-dialog`) never closed themselves: they fired a non-cancelable `lu-open-change` and waited for the owner to clear `open`. `lu-tooltip` and `lu-hover-card` had no public open state and fired nothing. A consumer had to know which model each element followed, and plain HTML had to wire a listener for a dialog to close at all.

The platform already has the single model: `<dialog>` closes itself on Escape after a cancelable `cancel` event, `<details>` toggles itself, and an input changes its value before telling. Web Awesome follows it for its overlays (`wa-hide`, cancelable, before closing). React's controlled components are the other idiom; they are an adapter concern, not an element one.

The owner decided on 2026-10-31 that every state the user can change is changed by the element itself, after a cancelable event that carries the new value and its source, and that control comes from cancelling that event and setting the property.

Chrome does not let a page cancel the `cancel` event of a dialog twice without a user activation in between (the close watcher's anti-abuse rule): the event then arrives with `cancelable` false and the dialog closes regardless.

## Decision

- **Every state the user can change is changed by the element**: `open` on `lu-dialog`, `lu-sheet`, `lu-confirm-dialog`, `lu-tooltip` and `lu-hover-card`; `value` on `lu-select`, `lu-segmented` and `lu-tabs`; `selected` on `lu-multi-select`. `lu-tooltip` and `lu-hover-card` gain a reflected `open` property.
- **Before the change, the element fires `lu-<noun>-change`**, bubbling, composed and cancelable, with the new value and `source`. It changes the property only if no listener called `preventDefault()`, and holds its previous value while the event runs.
- **Control is cancelling and setting.** A controlled owner cancels every event and sets the property itself, to the value asked for or another. Setting a property never fires an event.
- **`source` is one word from a closed vocabulary**, typed as `OpenChangeSource` and `ValueChangeSource`: `trigger`, `panel`, `escape`, `outside`, `close-button`, `cancel`, `form` for an open state; `option`, `clear` for a value. A new source is added to the type and to the Prop conventions page.
- **When the browser closes a dialog that could not be cancelled**, the dialog reports it with the same event; if that event is cancelled, the dialog shows again.
- **The confirm button of `lu-confirm-dialog` changes no state.** It fires `lu-confirm`, an action the owner performs, and the owner clears `open` when the action is done, with `pending` set in between. A `confirm` source would close the dialog before the action has run.
- **`pinned` on `lu-hover-card` overrides `open`** without touching it: the card shows while pinned, fires nothing, and follows `open` again `close-delay` after it is cleared.
- **The React adapter keeps its idiom.** Given `open` (or `value`, `selected`), a component is controlled: the adapter cancels the event, calls `onOpenChange(open, source)` and sets the property on every render. Without it, the adapter never sets the property, and the callback still runs.
- **The Vue adapter** exports `LuDialog`, `LuSheet`, `LuConfirmDialog`, `LuTooltip`, `LuHoverCard`, `LuSelect`, `LuSegmented`, `LuTabs` and `LuMultiSelect`, which render the element and support `v-model:open`, `v-model:value` and `v-model:selected` on the same rule: bound means controlled.

## Consequences

- An element works in plain HTML with no listener: a dialog closes on Escape, a tooltip shows on hover.
- A consumer that listened to `lu-open-change` and cleared `open` itself keeps working: the element has already cleared it, and clearing it again does nothing.
- A consumer that relied on a dialog staying open by not listening now has to cancel the event. Ariane goes through the React adapter, which cancels for it, so its behaviour does not change.
- `lu-open-change` is cancelable again, which ADR-0006's deprecation does not cover: the event keeps its name and gains `source`, a compatible addition.
- The Vue adapter now imports `vue` at run time, a peer dependency that stays optional for consumers who do not import `@slashome/lumen/vue`. Its components do not define the elements; the application imports them as before.
- A dialog that the browser forces closed and the owner keeps open flashes closed and open again, and its focus moves to its first focusable element.

## Alternatives considered

### Keep the overlays controlled and the fields uncontrolled

What existed. Two models to learn, and an overlay that does nothing in plain HTML until the owner wires a listener.

### A `controlled` attribute

The element would skip its own change when the attribute is set. It names a mode where an event already expresses the intent, and a consumer that sets it but forgets to listen gets an element that ignores the user. Cancelling is local to the one change and needs no second switch.

### Separate events before and after the change (`lu-hide` and `lu-after-hide`, as Web Awesome)

Twice the events for one state, and the « after » event is what the property's own reflection, or the next render, already tells.

### React's `defaultOpen` and `defaultValue`

Not added: an uncontrolled React component starts from the element's default. They can come later without changing this rule.

## Revisit if

A state needs a change the user starts but the element cannot finish alone, such as an asynchronous validation, which a cancel-then-set protocol expresses only through the owner; or the browser lets pages always cancel a dialog's `cancel`, which would remove the reopen fallback.
