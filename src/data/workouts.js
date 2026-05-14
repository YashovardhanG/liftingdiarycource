import { db } from "@/db";
import {
  workoutsTable,
  workoutExercisesTable,
  exercisesTable,
  setsTable,
  usersTable,
} from "@/db/schema";
import { and, eq, gte, lt, max } from "drizzle-orm";
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

export async function createWorkout(userId, data) {
  const [workout] = await db
    .insert(workoutsTable)
    .values({ user_id: userId, ...data })
    .returning({ id: workoutsTable.id });
  return workout;
}

export async function getWorkoutById(workoutId) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!dbUser) throw new Error("User not found");

  const [workout] = await db
    .select({
      id: workoutsTable.id,
      name: workoutsTable.name,
      started_at: workoutsTable.started_at,
    })
    .from(workoutsTable)
    .where(and(eq(workoutsTable.id, workoutId), eq(workoutsTable.user_id, dbUser.id)));

  return workout ?? null;
}

export async function getWorkoutWithExercises(workoutId) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!dbUser) throw new Error("User not found");

  const rows = await db
    .select({
      workoutId: workoutsTable.id,
      workoutName: workoutsTable.name,
      startedAt: workoutsTable.started_at,
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
    .where(and(eq(workoutsTable.id, workoutId), eq(workoutsTable.user_id, dbUser.id)))
    .orderBy(workoutExercisesTable.order, setsTable.set_number);

  if (rows.length === 0) return null;

  const workout = {
    id: String(rows[0].workoutId),
    name: rows[0].workoutName,
    started_at: rows[0].startedAt,
    exercises: new Map(),
  };

  for (const row of rows) {
    if (row.workoutExerciseId != null) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          workoutExerciseId: String(row.workoutExerciseId),
          name: row.exerciseName,
          sets: [],
        });
      }
      if (row.setId != null) {
        workout.exercises.get(row.workoutExerciseId).sets.push({
          id: String(row.setId),
          set_number: row.setNumber,
          reps: row.reps,
          weight: row.weight,
          weight_unit: row.weightUnit,
        });
      }
    }
  }

  return { ...workout, exercises: Array.from(workout.exercises.values()) };
}

export async function findOrCreateExercise(name) {
  const [existing] = await db
    .select({ id: exercisesTable.id })
    .from(exercisesTable)
    .where(eq(exercisesTable.name, name));

  if (existing) return existing;

  const [created] = await db
    .insert(exercisesTable)
    .values({ name })
    .returning({ id: exercisesTable.id });
  return created;
}

export async function addExerciseToWorkout(workoutId, exerciseId) {
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(workoutExercisesTable.order) })
    .from(workoutExercisesTable)
    .where(eq(workoutExercisesTable.workout_id, workoutId));

  const [workoutExercise] = await db
    .insert(workoutExercisesTable)
    .values({ workout_id: workoutId, exercise_id: exerciseId, order: (maxOrder ?? -1) + 1 })
    .returning({ id: workoutExercisesTable.id });
  return workoutExercise;
}

export async function addSetToWorkoutExercise(workoutExerciseId, { reps, weight, weight_unit }) {
  const [{ maxSetNumber }] = await db
    .select({ maxSetNumber: max(setsTable.set_number) })
    .from(setsTable)
    .where(eq(setsTable.workout_exercise_id, workoutExerciseId));

  const [set] = await db
    .insert(setsTable)
    .values({
      workout_exercise_id: workoutExerciseId,
      set_number: (maxSetNumber ?? 0) + 1,
      reps,
      weight,
      weight_unit,
    })
    .returning({ id: setsTable.id });
  return set;
}

export async function updateWorkout(userId, workoutId, data) {
  const [workout] = await db
    .update(workoutsTable)
    .set(data)
    .where(and(eq(workoutsTable.id, workoutId), eq(workoutsTable.user_id, userId)))
    .returning({ id: workoutsTable.id });
  return workout;
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