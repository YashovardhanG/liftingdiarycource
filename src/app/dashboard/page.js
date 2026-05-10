import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard — Lifting Diary",
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col gap-8 p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Workouts" value="0" />
        <StatCard label="This Week" value="0" />
        <StatCard label="Exercises Logged" value="0" />
      </div>

      <section>
        <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <ActionLink href="/workouts/new" label="Log Workout" />
          <ActionLink href="/workouts" label="View Workouts" />
          <ActionLink href="/exercises" label="Browse Exercises" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-4">Recent Workouts</h2>
        <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-6 text-center text-zinc-500 dark:text-zinc-400">
          No workouts logged yet. Start by logging your first workout!
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-6 flex flex-col gap-1">
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}

function ActionLink({ href, label }) {
  return (
    <a
      href={href}
      className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
    >
      {label}
    </a>
  );
}
