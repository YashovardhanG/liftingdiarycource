# Routing Coding Standards

## Route Structure

All app routes live under `/dashboard`. There is no top-level feature content outside of `/dashboard` (aside from auth pages).

```
/                        → public landing / redirect
/sign-in                 → Clerk sign-in (public)
/sign-up                 → Clerk sign-up (public)
/dashboard               → protected root
/dashboard/workout/new   → protected
/dashboard/workout/[workoutId] → protected
```

New feature routes go under `src/app/dashboard/` using App Router file conventions (`page.js`, `layout.js`, `loading.js`, etc.).

## Route Protection

All `/dashboard` routes are protected. Protection is enforced **exclusively via Next.js middleware** (`src/middleware.js`) using Clerk.

```js
// src/middleware.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

**Do NOT** add manual redirect or auth checks inside individual page components or layouts. The middleware is the single enforcement point.

## Public Routes

Only these routes are public:

- `/` — home/landing page
- `/sign-in` and sub-paths
- `/sign-up` and sub-paths

Everything else — including any new routes added under `/dashboard` — is automatically protected because it won't match `isPublicRoute`.

## Adding New Routes

1. Create the page under `src/app/dashboard/<feature>/page.js`.
2. No auth boilerplate needed in the page — middleware already protects it.
3. If the page fetches user data, follow `docs/data-fetching.md` and `docs/auth.md` for accessing `userId` via Clerk's `auth()`.
