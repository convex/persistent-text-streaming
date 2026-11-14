---
"@convex-dev/persistent-text-streaming": patch
---

The React `useStream` keeps a running stream when it re-renders with a new `URL`
object, token or headers, and reads the database under Strict Mode, like the
Svelte hook.
