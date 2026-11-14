# ADR-0018 — Pin Node in devEngines, not in a container

- **Status:** Accepted
- **Date:** 2026-11-14
- **Concerns:** ADR-0010

## Context

The CI ran Node 24, written three times in the workflows, while a contributor's machine ran Node 26. Nothing told either side which version Lumen is built and tested with. A Storybook that would not show the new logo was first taken for an environment problem; it was a checkout 16 commits behind `develop`.

Two ways to give everyone the same Node: run the Storybook and the tests in a Docker image, or declare the runtime in `package.json`. pnpm 12 reads `devEngines.runtime` and, with `onFail: "download"`, installs that Node into `node_modules` and runs every script with it, whatever Node the machine has. `actions/setup-node` reads the same field with `node-version-file: package.json`.

A container would pin Node too, but at a cost: file watching through a bind mount is unreliable on macOS, so the Storybook would lose hot reload; native binaries such as esbuild, Rollup and Playwright's Chromium differ between the macOS host and the Linux image, so `node_modules` could not be shared with the editor; and every contributor would need Docker to work on a CSS library.

On 2026-11-14 Node 26 is the active LTS (« Lithium »), Node 24 is in maintenance.

## Decision

- **The Node of Lumen is declared once, in `devEngines.runtime` of `package.json`**, an exact version, with `onFail: "download"`. `pnpm install` brings it; nothing else needs installing but pnpm.
- **The workflows read it** with `node-version-file: package.json`; no workflow writes a Node version.
- **The version is the active LTS**, 26.13.1 today, bumped by hand like any other pinned dependency.
- **No `engines.node`.** Lumen runs in the browser: its consumers build with the Node they choose, and `engines` would warn them for nothing. `devEngines` concerns only those who work on Lumen.
- **No container** for the Storybook or the tests.

## Consequences

- A contributor and the CI run the same Node without a version manager; a change of version is one line in a pull request.
- `pnpm install` downloads Node once per store, about 30 MB.
- npm also reads `devEngines` but cannot download a runtime: run in the repository under another Node, it stops with `EBADDEVENGINES`. Lumen is worked on with pnpm only, and the CI runs the pinned Node, so this only bites an `npm` typed by hand.
- A tool run outside pnpm, a `node` typed in the shell or an editor's language server, still uses the machine's Node; only pnpm scripts and `pnpm exec` are pinned.
- A problem that a container would hide, such as a stale checkout, still has to be found by looking at the checkout.
