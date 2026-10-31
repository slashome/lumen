# Changesets

Every pull request that changes `src/`, `tokens/` or `icons/` adds one file here with `pnpm changeset`: the semver level of the change and one line for the changelog, written for someone who uses Lumen. A change that ships nothing takes `pnpm changeset --empty`.

`pnpm changeset version` consumes these files into `CHANGELOG.md` and `package.json` at release time. See the Release section of the README and ADR-0008.
