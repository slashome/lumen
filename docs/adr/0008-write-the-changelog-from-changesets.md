# ADR-0008 — Write the changelog from changesets

- **Status:** Accepted, amended by [ADR-0010](0010-integrate-on-develop-publish-from-main.md)
- **Date:** 2026-10-31
- **Concerns:** ADR-0006, ADR-0007

## Context

Lumen had no changelog. A consumer could not tell what changed between two versions, and ADR-0006 promises that a deprecation is announced at least one minor version before its removal, which needs a place to announce it.

Several pull requests are open at once, often written by agents in parallel. A single `CHANGELOG.md` edited by hand in each of them conflicts on its first lines every time two of them land.

The Release workflow publishes on a `v*` tag pushed by the owner, after checking that the tag matches `version` in `package.json`, with `--provenance`. The repository holds one secret, `NPM_TOKEN`, used only to publish. Version 0.1.0 has never been published.

`@changesets/changelog-github`, the generator that links each entry to its pull request, asks the GitHub API for it and throws without a `GITHUB_TOKEN` (`@changesets/get-github-info`, `index.mjs`).

## Decision

- **Every pull request that changes `src/`, `tokens/` or `icons/` adds a changeset**, a file in `.changeset/` made by `pnpm changeset`: the semver level and one line written for a consumer. A change that ships nothing takes an empty changeset. `.changeset/config.json` lists these folders in `changedFilePatterns`; a pull request that touches only docs, stories or workflows needs none.
- **CI enforces it.** On a pull request, `ci.yml` runs `pnpm changeset status --since=origin/<base of the pull request>`, which fails when those folders changed and no changeset was added since that base. The checkout uses `fetch-depth: 0` so that the base branch and the merge base exist.
- **The release stays a tag pushed by the owner.** On `main`: `pnpm changeset version`, which writes `CHANGELOG.md` and bumps `package.json`; a commit; a tag `v<version>`; a push. No release bot, no `changesets/action`, no release pull request.
- **The changelog generator is the default one** (`@changesets/cli/changelog`): each entry carries the short hash of the commit that added its changeset, without a link, because the GitHub generator needs a token on the owner's machine at every release. The first section, 0.1.0, is written by hand and links pull requests #1 to #5.
- **The Release workflow creates a GitHub Release** with `gh release create` and the workflow's own `GITHUB_TOKEN`, so the job needs `contents: write`. Its notes are the version's section of `CHANGELOG.md`, read by `scripts/release-notes.js` before the build, so a tag whose version has no section fails before anything is published.
- **`CHANGELOG.md` ships in the package** (`files`) and is rendered in the Storybook by the Foundations/Changelog page, which imports it raw.

## Consequences

- Parallel pull requests never conflict on the changelog: each adds its own file, and only the release commit writes `CHANGELOG.md`.
- The author of a change, who knows it best, writes its changelog line, and a reviewer reads it in the diff.
- A pull request that changes `src/` for a purely internal reason still needs a changeset, if only an empty one.
- Changelog entries do not link to their pull request; finding it takes the commit hash.
- The Release workflow can now write to the repository's contents, which it needs only for the release.
- The release commit and its tag are pushed to `main` directly, so a protection of `main` must let the owner push.
- Under 1.0.0, Changesets turns a `major` changeset into 1.0.0 and a `minor` into 0.x+1, which matches ADR-0006 as long as removals are declared `major`.

## Alternatives considered

### A `CHANGELOG.md` edited by hand in each pull request

No tool, but every pair of parallel pull requests conflicts on the same lines, and nothing checks that a change was written down.

### `@changesets/changelog-github`

Each entry would link to its pull request and its author. It throws without a `GITHUB_TOKEN` when `pnpm changeset version` runs, so every release on the owner's machine would need a personal token in the environment.

### `changesets/action` and its release pull request

It opens a "Version Packages" pull request and publishes on merge. It replaces the tag the owner pushes and the check of the tag against `package.json`, and adds a bot that commits to the repository.

### Conventional commits read by a release tool

The changelog would come from commit titles. Commit titles here describe the code for the reader of the history, not the change for the consumer, and a squash or a rebase rewrites what the changelog would say.

## Revisit if

A release starts from CI instead of the owner's tag, which would make `changesets/action` the simpler path; or a token becomes available where `pnpm changeset version` runs, which would let the GitHub generator link each entry to its pull request.
