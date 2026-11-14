# ADR-0019 — Publish to npm with trusted publishing

- **Status:** Accepted
- **Date:** 2026-11-14
- **Concerns:** ADR-0008, ADR-0010

## Context

`@slashome/lumen` 0.2.0, its first version on npm, was published by `release.yml` with a granular npm token stored as the `NPM_TOKEN` secret. A token able to publish without the owner's second factor has to bypass 2FA, and npm is restricting such tokens: account changes from August 2026, direct publishing from January 2027. A stored token is also a secret that can leak and that expires.

npm trusted publishing replaces the token with the OIDC identity of the workflow: npm is told once, in the package settings, that `release.yml` of `slashome/lumen` may publish, and pnpm exchanges the job's `id-token` for a short-lived publish token. It can only be set on a package that exists, which is why 0.2.0 still needed a token.

## Decision

- **`release.yml` publishes by trusted publishing**, with `id-token: write` and no npm token. The `NPM_TOKEN` secret and the token are deleted.
- **The publish job has no dependency cache.** A cache restored into the job that holds the OIDC token could run code written by another workflow; `setup-node` advises against caching in publishing workflows.
- `--provenance` stays: the package keeps a signed statement of the commit and workflow that built it.

## Consequences

- Publishing needs no secret: nobody manages, rotates or leaks an npm token.
- Renaming `release.yml`, or moving the repository, breaks publishing until the trusted publisher is updated on npmjs.com.
- The release job installs its dependencies without a cache, a little slower.
