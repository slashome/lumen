# @slashome/lumen

## 0.1.0

### Minor Changes

The first version of Lumen, the design system of slashome, extracted from the `shared/ui` of Ariane. One implementation serves React, Vue, Svelte and plain HTML.

- [#1](https://github.com/slashome/lumen/pull/1): design tokens in DTCG JSON, built by Style Dictionary into `tokens.css`, with a two-color theme (`--lu-theme-primary`, `--lu-theme-secondary`) and a dark mode set at runtime. CSS classes for what has no state (button, badge, input, native select, switch, kbd, data table, page states, utilities); custom elements for what has one (`lu-dialog`, `lu-sheet`, `lu-confirm-dialog`, `lu-select`, `lu-multi-select`, `lu-tooltip`, `lu-hover-card`, `lu-segmented`, `lu-toaster`, `lu-markdown`, `lu-highlight`, `lu-drag-area`). `lu-icon` draws icons embedded at build time under semantic names, with no network request. React wrappers in `@slashome/lumen/react`, Vue types in `@slashome/lumen/vue`. Everything public is prefixed `lu-`.
- [#2](https://github.com/slashome/lumen/pull/2): every semantic token carries a description, shown on the Tokens page of the Storybook, and the build fails on a token without one. The docs no longer contradict the `lu-` prefix.
- [#3](https://github.com/slashome/lumen/pull/3): one entry point per element (`@slashome/lumen/select`) and a precise `sideEffects`, so importing one element no longer ships Markdown or drag and drop. Every existing export path still works.
- [#4](https://github.com/slashome/lumen/pull/4): every element documents its public API in JSDoc; `custom-elements.json` feeds the Storybook props tables and the React and Vue types. The Storybook is sorted by use. Tokens and element APIs can be deprecated for at least a minor version before their removal in a major.
- [#5](https://github.com/slashome/lumen/pull/5): every story runs as a browser test in Chromium and fails on an accessibility violation. Fixes a draggable picked up by Space that dropped in place, and a quickly reopened dialog that closed itself.
