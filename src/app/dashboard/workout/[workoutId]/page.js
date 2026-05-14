import { notFound } from "next/navigation";
import { getWorkoutWithExercises } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

export default async function EditWorkoutPage({ params }) {
  const { workoutId } = await params;
  const workout = await getWorkoutWithExercises(Number(workoutId));

  if (!workout) notFound();

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Edit workout</h1>
      <EditWorkoutForm workout={workout} />
    </main>
  );
}
