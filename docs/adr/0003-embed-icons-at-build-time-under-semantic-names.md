# ADR-0003 — Embed icons at build time under semantic names

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0001

## Context

Ariane uses about fifty Lucide icons through `lucide-react`, which only React can render. Iconify gathers every open icon set under one format, but its `<iconify-icon>` element fetches icons from the Iconify API at run time. Ariane is served by its own binary on loopback and makes no external request.

## Decision

- `<lumen-icon name="close">` draws an icon by **semantic name**. `icons/lumen.json` maps each name to an Iconify id (`close` → `lucide:x`).
- `lumen-icons <mapping.json> <output.ts>` reads the SVG data from the installed `@iconify-json/*` sets and writes a module. Lumen builds its own set with it; an application builds its names the same way and passes the module to `registerIcons()`.
- Nothing is fetched at run time.

## Consequences

Changing an icon set is a change of the mapping, not of the code that uses the icons. The bundled set costs about 23 kB before compression; an application that needs a few more icons pays only for those.

## Alternatives considered

### `<iconify-icon>` as it is

The request to the Iconify API at run time breaks Ariane's no-network rule and every offline use.

### One component per icon, as `lucide-react` does

Tied to a framework, and the icon set is wired into every call site.

## Revisit if

The number of names grows to where a per-application tree-shaken set beats one shared module.
