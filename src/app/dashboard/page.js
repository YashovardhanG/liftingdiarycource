import { getUserWorkouts } from "@/data/workouts";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({ searchParams }) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();
  const workouts = await getUserWorkouts(date);
  return <DashboardClient workouts={workouts} selectedDate={date.toISOString()} />;
}