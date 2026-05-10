# Server Components Coding Standards

## params and searchParams MUST Be Awaited

In Next.js 15, `params` and `searchParams` are **Promises**. You must `await` them before accessing any properties. This applies to every page, layout, and route handler that receives these props.

```js
// CORRECT
export default async function WorkoutPage({ params }) {
  const { workoutId } = await params;
  // ...
}

// CORRECT
export default async function DashboardPage({ searchParams }) {
  const { date } = await searchParams;
  // ...
}

// WRONG — params is a Promise, not a plain object
export default async function WorkoutPage({ params }) {
  const { workoutId } = params; // undefined — do NOT do this
}
```

This is a **breaking change** from Next.js 13/14. Never destructure `params` or `searchParams` directly from the function argument.

## Server Components Are Always Async

All server components must be declared as `async` functions. There is no reason to write a synchronous server component — if you don't need `await` today, you will when you add data fetching.

```js
// CORRECT
export default async function Page({ params }) { ... }

// WRONG
export default function Page({ params }) { ... }
```

## No Client APIs in Server Components

Server components run on the server — never use:

- `useState`, `useEffect`, `useRef`, or any other React hook
- `useRouter`, `usePathname`, `useSearchParams`
- Browser globals (`window`, `document`, `localStorage`)

If you need any of these, the component must be a Client Component (`"use client"`).

## Passing Data to Client Components

Fetch data in the server component and pass it down as props to client components. Never fetch inside a client component.

```js
// page.js (server component)
import MyClientComponent from "./MyClientComponent";
import { getWorkoutById } from "@/data/workouts";

export default async function Page({ params }) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(Number(workoutId));

  return <MyClientComponent workout={workout} />;
}
```

## notFound() for Missing Resources

Use Next.js `notFound()` to render a 404 when a resource does not exist or does not belong to the current user.

```js
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(Number(workoutId));

  if (!workout) notFound();

  return ...;
}
```
