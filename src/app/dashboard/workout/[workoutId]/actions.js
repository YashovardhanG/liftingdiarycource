"use server";

import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  name: z.string().min(1),
  started_at: z.string().datetime(),
});

export async function updateWorkoutAction(workoutId, name, started_at) {
  const parsed = updateWorkoutSchema.safeParse({ name, started_at });
  if (!parsed.success) throw new Error("Invalid input");

  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!dbUser) throw new Error("User not found");

  const workout = await updateWorkout(dbUser.id, Number(workoutId), {
    name: parsed.data.name,
    started_at: new Date(parsed.data.started_at),
  });

  if (!workout) throw new Error("Workout not found");

  return workout;
}
