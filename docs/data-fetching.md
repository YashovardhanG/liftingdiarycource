# Data Fetching

## CRITICAL: Server Components Only

All data fetching in this app **must** be done exclusively via **React Server Components**.

- **NEVER** fetch data in client components (`"use client"`)
- **NEVER** fetch data in route handlers (`app/api/`)
- **NEVER** use `useEffect` + `fetch` patterns
- **NEVER** use SWR, React Query, or any client-side fetching library

If you need data in a client component, fetch it in a parent server component and pass it down as props.

## Database Access: `/data` Directory

All database queries **must** go through helper functions in the `/data` directory. These functions use Drizzle ORM — **never write raw SQL**.

```
src/
  data/
    workouts.js   # e.g. getUserWorkouts(), getWorkoutById()
    exercises.js  # e.g. getUserExercises()
    ...
```

Each helper function is responsible for one thing and is called directly from a server component.

## User Data Isolation — Non-Negotiable

Every query that returns user data **must** filter by the authenticated user's ID. A logged-in user must only ever be able to access their own data.

**Always** do this:

```js
// src/data/workouts.js
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getUserWorkouts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id));
}
```

**Never** do this:

```js
// WRONG — accepts userId as a parameter, caller could pass any ID
export async function getWorkouts(userId) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

The authenticated user's ID must be resolved **inside** the helper function, never passed in as an argument. This prevents accidental or malicious access to another user's data.

## Pattern Summary

```
Server Component
  └── calls helper from /data
        └── resolves auth inside helper
        └── queries DB via Drizzle ORM with userId filter
        └── returns data to server component
              └── passes data as props to any client components if needed
```
