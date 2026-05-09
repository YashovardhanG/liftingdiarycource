# Data Mutations Coding Standards

## Overview

All data mutations follow a two-layer pattern:

1. **`/data` helper** — wraps the Drizzle ORM call
2. **Server Action** — validates input, resolves auth, calls the helper

Never write Drizzle calls directly inside server actions, and never mutate data from client components without going through a server action.

## Layer 1: `/data` Helpers

All database mutation calls must go through helper functions in `src/data/`. These functions are thin wrappers around Drizzle ORM — no validation, no business logic.

```
src/
  data/
    workouts.js    # e.g. createWorkout(), deleteWorkout()
    exercises.js   # e.g. createExercise(), updateExercise()
    ...
```

```js
// src/data/workouts.js
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId, data) {
  return db.insert(workouts).values({ ...data, userId });
}

export async function deleteWorkout(userId, workoutId) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId), eq(workouts.userId, userId));
}
```

Never write raw SQL. Never call `db` directly from a server action or component.

## Layer 2: Server Actions

All data mutations must be triggered via **Server Actions**. Server actions must live in colocated `actions.js` files — one per route segment.

```
src/app/
  dashboard/
    workouts/
      page.js
      actions.js   <-- server actions for this route
```

Every `actions.js` file must begin with `"use server"`.

```js
"use server";
```

### Typed Parameters — No FormData

Server action parameters must be explicit typed arguments. Do NOT use `FormData` as a parameter type.

```js
// CORRECT
export async function createWorkoutAction(name, date, notes) { ... }

// WRONG — FormData is banned
export async function createWorkoutAction(formData) { ... }
```

### Zod Validation — Required

Every server action must validate its arguments with **Zod** before doing anything else. Do not trust the caller.

```js
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export async function createWorkoutAction(name, date, notes) {
  const parsed = createWorkoutSchema.safeParse({ name, date, notes });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return createWorkout(userId, parsed.data);
}
```

Define the Zod schema at the top of the file, outside the action function, so it is not reconstructed on every call.

### Auth Check

Every server action that touches user data must resolve and verify `userId` from Clerk after validation, before calling the `/data` helper.

Never accept `userId` as a parameter — always resolve it internally.

## Pattern Summary

```
Client Component
  └── calls server action from colocated actions.js
        └── validates args with Zod schema
        └── resolves userId via Clerk auth()
        └── calls /data helper with userId + validated data
              └── /data helper executes Drizzle ORM mutation
```

## What Not To Do

- Do NOT call `db` directly from a server action or component
- Do NOT use `FormData` as a server action parameter
- Do NOT skip Zod validation, even for simple inputs
- Do NOT accept `userId` as a parameter — resolve it from Clerk
- Do NOT put server actions in a shared global file — colocate them with the route
- Do NOT call `redirect()` inside a server action — server actions must return data only. Redirects must be handled client-side via `router.push()` after the server action resolves
