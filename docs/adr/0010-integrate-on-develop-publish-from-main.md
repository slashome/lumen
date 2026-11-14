# ADR-0010 — Integrate on develop, publish from main

- **Status:** Accepted
- **Date:** 2026-10-31
- **Concerns:** ADR-0007, ADR-0008

## Context

Lumen had one long-lived branch, `main`. Work landed there, the Storybook was deployed from it on every push, and ADR-0008 had the owner run `pnpm changeset version` and tag on it. What was on `main` was therefore both the work in progress and what consumers read in the Storybook, before any version of it was published on npm.

Work on Lumen is done by the owner and by agents, often in parallel, and the owner pushes their work directly instead of opening a pull request for each change. Ariane's code repository already integrates on `develop`.

`pnpm changeset status --since=<ref>` counts the changesets that are present in the working tree and changed since `<ref>`, and fails when `src/`, `tokens/` or `icons/` changed since `<ref>` without one (`@changesets/cli`, `dist/status.mjs`; `@changesets/read`, `filterChangesetsSinceRef`). After `pnpm changeset version`, the changesets are deleted while the changes they described remain.

## Decision

- **`develop` integrates, `main` publishes.** Work is committed and pushed on `develop`, or reaches it through a pull request. `main` only receives merges of `develop`, each one a release.
- **The release** runs on `develop`: `pnpm changeset version`, check `CHANGELOG.md` and `package.json`, commit, push. Then `develop` is merged into `main`, the tag `v<version>` is put on that merge on `main`, and both are pushed.
- **CI** runs on every push to `develop` and `main` and on every pull request. The changeset check runs on a pull request against its base, as before, and on a push to `develop` against the commit `develop` pointed to before the push (`github.event.before`). It does not run on a push to `main` nor on a pull request into `main`, where the release has already consumed the changesets.
- **The Release workflow fails** unless the tagged commit is an ancestor of `origin/main`.
- **The Storybook is deployed from `main`**, so it shows what is published, not what is in progress.
- `.changeset/config.json` names `develop` as `baseBranch`.
- The default branch of the GitHub repository is `develop`, so pull requests target it by default.

## Consequences

- A push to `develop` that changes `src/`, `tokens/` or `icons/` without adding a changeset fails CI, as a pull request does.
- The release commit must be pushed on its own: pushed together with unreleased changes, it removes the changesets those changes added and the check fails.
- A fix to the Storybook or the docs reaches the published site only with the next merge into `main`.
- `main` can be protected against direct pushes except the owner's merge and tag.
- Two branches to keep in step: a commit made on `main` by mistake has to be merged back into `develop`.

## Alternatives considered

### Keep `main` alone

What existed. The Storybook shows unpublished work as if it were released, and nothing distinguishes a commit that is ready to publish from one that is not.

### Compare the changeset check on `develop` to `origin/main`

It would check everything not yet released. Right after `pnpm changeset version` on `develop`, the changes are still ahead of `main` and their changesets are gone, so every release commit would fail CI.

### Compare it to `HEAD^`

It checks only the last commit of a push: a push of three commits whose changeset sits in the first and whose last one changes `src/` would fail, although the push as a whole is complete.

## Revisit if

Releases move to CI (`changesets/action`), which would publish from whatever branch it runs on, or a second published line (a maintenance branch for an older major) has to exist beside `main`.
