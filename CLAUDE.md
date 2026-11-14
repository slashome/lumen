# Lumen

The rules are in [`CONTRIBUTING.md`](CONTRIBUTING.md), the decisions behind them in [`docs/adr`](docs/adr). Read both before changing anything.

The three rules most often forgotten:

- **Run every check before pushing**, all of them, not only the ones your change seems to touch: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:browser && pnpm build && pnpm build-storybook`.
- **Add a changeset** for any change to `src/`, `tokens/` or `icons/` (`pnpm changeset`, or `pnpm changeset --empty` when nothing ships). CI fails without it.
- **No comments in code**, except the public JSDoc of a custom element, which feeds `custom-elements.json`.

Work goes to `develop`, never to `main`.
