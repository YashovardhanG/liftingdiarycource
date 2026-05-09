"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

export default function DashboardClient({ workouts, selectedDate }) {
  const router = useRouter();
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full">
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight">Liftingdiary</h1>
      </div>
      <div className="flex flex-col gap-6 px-8 pb-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold">Workout Log</h2>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                  router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {workouts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          No workouts logged for this date.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    {workout.name ?? "Unnamed workout"}
                  </CardTitle>
                  <p className="text-xs text-zinc-400">
                    Started: {format(new Date(workout.started_at), "h:mm a")}
                    {workout.completed_at && (
                      <> · Finished: {format(new Date(workout.completed_at), "h:mm a")}</>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  {workout.exercises.length > 0 && (
                    <ul className="flex flex-col gap-4">
                      {workout.exercises.map((ex) => (
                        <li key={ex.workoutExerciseId}>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                            {ex.name}
                          </p>
                          {ex.sets.length > 0 && (
                            <table className="w-full text-xs text-zinc-600 dark:text-zinc-400">
                              <thead>
                                <tr className="text-left text-zinc-400 dark:text-zinc-500">
                                  <th className="pr-4 pb-1 font-normal">Set</th>
                                  <th className="pr-4 pb-1 font-normal">Reps</th>
                                  <th className="pb-1 font-normal">Weight</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ex.sets.map((set) => (
                                  <tr key={set.id}>
                                    <td className="pr-4">{set.set_number}</td>
                                    <td className="pr-4">{set.reps}</td>
                                    <td>{set.weight} {set.weight_unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
