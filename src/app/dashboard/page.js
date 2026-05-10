import { SignInButton } from "@clerk/nextjs";
import { Show } from "@clerk/nextjs";
import { Dumbbell, Calendar, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
      <div className="rounded-lg bg-muted p-2.5">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SignedInDashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your lifting progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Dumbbell} label="Total Workouts" value="—" />
        <StatCard icon={Calendar} label="This Week" value="—" />
        <StatCard icon={TrendingUp} label="Exercises Logged" value="—" />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/workouts/new">
              <Plus className="size-4" />
              Log Workout
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/workouts">View Workouts</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/exercises">Browse Exercises</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Recent Workouts</h2>
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No workouts yet. Start by logging your first session!
        </div>
      </div>
    </div>
  );
}

function SignedOutDashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Dumbbell className="size-12 text-muted-foreground" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lifting Diary</h1>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Sign in to track your workouts, monitor progress, and achieve your goals.
        </p>
      </div>
      <SignInButton mode="modal">
        <Button size="lg">Sign In to Continue</Button>
      </SignInButton>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Show when="signed-in">
        <SignedInDashboard />
      </Show>
      <Show when="signed-out">
        <SignedOutDashboard />
      </Show>
    </>
  );
}
