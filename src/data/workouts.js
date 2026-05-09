import { db } from "@/db";
import {
  workoutsTable,
  workoutExercisesTable,
  exercisesTable,
  setsTable,
  usersTable,
} from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

function dayStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayEnd(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getUserWorkouts(date = new Date()) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!dbUser) return [];

  const rows = await db
    .select({
      workoutId: workoutsTable.id,
      workoutName: workoutsTable.name,
      startedAt: workoutsTable.started_at,
      completedAt: workoutsTable.completed_at,
      workoutExerciseId: workoutExercisesTable.id,
      exerciseName: exercisesTable.name,
      setId: setsTable.id,
      setNumber: setsTable.set_number,
      reps: setsTable.reps,
      weight: setsTable.weight,
      weightUnit: setsTable.weight_unit,
    })
    .from(workoutsTable)
    .leftJoin(workoutExercisesTable, eq(workoutExercisesTable.workout_id, workoutsTable.id))
    .leftJoin(exercisesTable, eq(exercisesTable.id, workoutExercisesTable.exercise_id))
    .leftJoin(setsTable, eq(setsTable.workout_exercise_id, workoutExercisesTable.id))
    .where(
      and(
        eq(workoutsTable.user_id, dbUser.id),
        gte(workoutsTable.started_at, dayStart(date)),
        lt(workoutsTable.started_at, dayEnd(date)),
      )
    )
    .orderBy(workoutsTable.started_at, workoutExercisesTable.order, setsTable.set_number);

  const workoutMap = new Map();
  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: String(row.workoutId),
        name: row.workoutName,
        started_at: row.startedAt,
        completed_at: row.completedAt,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(row.workoutId);

    if (row.workoutExerciseId != null) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          workoutExerciseId: String(row.workoutExerciseId),
          name: row.exerciseName,
          sets: [],
        });
      }
      const exercise = workout.exercises.get(row.workoutExerciseId);

      if (row.setId != null) {
        exercise.sets.push({
          id: String(row.setId),
          set_number: row.setNumber,
          reps: row.reps,
          weight: row.weight,
          weight_unit: row.weightUnit,
        });
      }
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()),
  }));
}