import NewWorkoutForm from "./NewWorkoutForm";

export default async function NewWorkoutPage({ searchParams }) {
  const { date } = await searchParams;
  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">New workout</h1>
      <NewWorkoutForm defaultDate={date ?? null} />
    </main>
  );
}
