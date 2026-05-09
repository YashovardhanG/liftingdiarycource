# Authentication Coding Standards

## Provider: Clerk

This app uses **Clerk** for all authentication. Do NOT use NextAuth, Auth.js, custom JWT logic, session cookies, or any other auth mechanism.

## Accessing the Current User

**In Server Components and `/data` helper functions**, use Clerk's `auth()` helper:

```js
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

**In Client Components**, use Clerk's `useUser` hook:

```js
"use client";
import { useUser } from "@clerk/nextjs";

const { user, isLoaded } = useUser();
```

Never pass `userId` as a prop or query parameter to derive the current user — always resolve it from Clerk directly.

## Protecting Routes

Use Clerk middleware to protect routes. The middleware config lives in `src/middleware.js`:

```js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

Do NOT guard individual pages or components with manual redirect logic — let the middleware handle route protection.

## Sign In / Sign Up UI

Use Clerk's prebuilt components. Do NOT build custom auth forms.

```js
import { SignIn } from "@clerk/nextjs";
// or
import { SignUp } from "@clerk/nextjs";
```

Mount them at `src/app/sign-in/[[...sign-in]]/page.js` and `src/app/sign-up/[[...sign-up]]/page.js` respectively.

## User Data Isolation

Every `/data` helper that queries user-owned records must resolve `userId` from Clerk internally — never accept it as a parameter. See `docs/data-fetching.md` for the full pattern.

```js
// src/data/workouts.js — CORRECT
import { auth } from "@clerk/nextjs/server";

export async function getUserWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```js
// WRONG — caller controls which user's data is returned
export async function getUserWorkouts(userId) { ... }
```

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

Never hardcode these values or commit them to source control.
