# Changesets

Every change to `src/`, `tokens/` or `icons/` adds one file here with `pnpm changeset`: the semver level of the change and one line for the changelog, written for someone who uses Lumen. A change that ships nothing takes `pnpm changeset --empty`.

`pnpm changeset version`, run on `develop` at release time, consumes these files into `CHANGELOG.md` and `package.json`. See the Releasing section of the README, ADR-0008 and ADR-0010.
