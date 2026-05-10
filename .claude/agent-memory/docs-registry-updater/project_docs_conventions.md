---
name: Docs registry conventions
description: Formatting rules and observed patterns for the CLAUDE.md docs bullet list in this project
type: project
---

Bullet list entries use an em dash followed by a space and a relative path from the project root: `— docs/<filename>.md`

The list lives under the `## IMPORTANT: Always Consult \`/docs\` First` section, immediately after the "Do not assume behavior from prior knowledge" sentence (no blank line between that sentence and the first bullet).

New entries are appended at the end of the list (no strict alphabetical ordering observed — files are listed roughly in order of addition).

Files registered as of 2026-05-09:
- docs/ui.md
- docs/data-fetching.md
- docs/auth.md
- docs/data-mutations.md
- docs/server-components.md
- docs/routing.md

**Why:** Keeping this memory avoids re-deriving the format each conversation.
**How to apply:** When a new docs file is added, append `— docs/<filename>.md` to the end of the bullet list.
