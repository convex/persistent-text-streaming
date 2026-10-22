# Changelog

## 0.3.5

- feat(svelte): Add Svelte 5 bindings for persistent text streaming (#13)
- Internally switched from paginator helper to built-in .paginate, removing peer
  dependency on convex-helpers

## 0.3.4

- Updates the /test entrypoint for compatibility with convex-test's new
  `defineTestApp` capability.

## 0.3.3

- Update ctx types for convex@1.41+

## 0.3.2

- Enables streaming multiple times per hook

## 0.3.1

- Support deleting old streams asynchronously

## 0.3.0

- Adds /test and /\_generated/component.js entrypoints
- Drops commonjs support
- Improves source mapping for generated files
- Changes to a statically generated component API
