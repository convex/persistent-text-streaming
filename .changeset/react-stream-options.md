---
"@convex-dev/persistent-text-streaming": patch
---

The React `useStream` keeps a running stream when it re-renders with a new `URL`
object, token or headers, and reads the database for a stream it already
requested, like the Svelte hook.
