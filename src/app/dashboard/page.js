import DashboardClient from "./DashboardClient";

const STUB_WORKOUTS = [
  {
    id: "1",
    name: "Push Day",
    started_at: "2026-05-09T08:00:00",
    completed_at: "2026-05-09T09:15:00",
    exercises: [
      {
        workoutExerciseId: "e1",
        name: "Bench Press",
        sets: [
          { id: "s1", set_number: 1, reps: 8, weight: 80, weight_unit: "kg" },
          { id: "s2", set_number: 2, reps: 8, weight: 80, weight_unit: "kg" },
          { id: "s3", set_number: 3, reps: 6, weight: 85, weight_unit: "kg" },
        ],
      },
      {
        workoutExerciseId: "e2",
        name: "Overhead Press",
        sets: [
          { id: "s4", set_number: 1, reps: 10, weight: 50, weight_unit: "kg" },
          { id: "s5", set_number: 2, reps: 9, weight: 50, weight_unit: "kg" },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  return <DashboardClient workouts={STUB_WORKOUTS} />;
}
