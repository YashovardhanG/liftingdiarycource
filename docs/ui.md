# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do NOT create custom components. If a UI element is needed, find the appropriate shadcn/ui component.
- Do NOT use raw HTML elements for UI (e.g. `<button>`, `<input>`, `<dialog>`) — use the shadcn/ui equivalents (`Button`, `Input`, `Dialog`, etc.).
- Do NOT install or use any other component library (e.g. MUI, Chakra, Radix directly, Headless UI).
- shadcn/ui components live in `src/components/ui/`. Add new ones via the shadcn CLI: `npx shadcn@latest add <component>`.

## Date Formatting

All date formatting must use **date-fns**.

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use `format` from `date-fns` with the `do MMM yyyy` format string:

```js
import { format } from 'date-fns';

format(date, 'do MMM yyyy'); // "1st Sep 2025"
```

Do NOT use `Date.toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.
