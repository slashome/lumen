---
'@slashome/lumen': minor
---

`lu-tooltip` and `lu-hover-card` no longer wrap their trigger: they name it with `for="<id>"` (property `htmlFor`), or take it in the `anchor` property, and set `aria-describedby`, or `aria-expanded` and `aria-controls`, on it themselves. Their default slot is their content: the tooltip's `content` attribute and the hover card's `trigger` slot are removed, and so are the `tooltip` and `card` parts, the element being the popover itself. In React, `Tooltip` and `HoverCard` take `htmlFor` and their content as children.
