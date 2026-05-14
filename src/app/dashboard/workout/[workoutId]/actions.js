"use server";

import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateWorkout, findOrCreateExercise, addExerciseToWorkout, addSetToWorkoutExercise } from "@/data/workouts";

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

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().min(1).max(255),
});

export async function addExerciseAction(workoutId, exerciseName) {
  const parsed = addExerciseSchema.safeParse({ workoutId: Number(workoutId), exerciseName });
  if (!parsed.success) throw new Error("Invalid input");

  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const exercise = await findOrCreateExercise(parsed.data.exerciseName);
  const workoutExercise = await addExerciseToWorkout(parsed.data.workoutId, exercise.id);
  return { workoutExerciseId: String(workoutExercise.id) };
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
  weight_unit: z.enum(["kg", "lbs"]),
});

export async function addSetAction(workoutExerciseId, reps, weight, weight_unit) {
  const parsed = addSetSchema.safeParse({
    workoutExerciseId: Number(workoutExerciseId),
    reps: Number(reps),
    weight: Number(weight),
    weight_unit,
  });
  if (!parsed.success) throw new Error("Invalid input");

  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const set = await addSetToWorkoutExercise(parsed.data.workoutExerciseId, {
    reps: parsed.data.reps,
    weight: parsed.data.weight,
    weight_unit: parsed.data.weight_unit,
  });
  return { setId: String(set.id) };
}
