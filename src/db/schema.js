import {
  integer,
  pgTable,
  varchar,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const weightUnitEnum = pgEnum("weight_unit", ["kg", "lbs"]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const workoutsTable = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }),
  started_at: timestamp({ withTimezone: true }).notNull(),
  completed_at: timestamp({ withTimezone: true }),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const workoutExercisesTable = pgTable("workout_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workout_id: integer()
    .notNull()
    .references(() => workoutsTable.id, { onDelete: "cascade" }),
  exercise_id: integer()
    .notNull()
    .references(() => exercisesTable.id, { onDelete: "restrict" }),
  order: integer().notNull().default(0),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const setsTable = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workout_exercise_id: integer()
    .notNull()
    .references(() => workoutExercisesTable.id, { onDelete: "cascade" }),
  set_number: integer().notNull(),
  reps: integer().notNull(),
  weight: numeric({ precision: 8, scale: 3, mode: "number" }).notNull(),
  weight_unit: weightUnitEnum().notNull().default("kg"),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
