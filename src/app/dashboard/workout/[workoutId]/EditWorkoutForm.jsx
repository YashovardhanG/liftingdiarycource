"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWorkoutAction, addExerciseAction, addSetAction } from "./actions";

export default function EditWorkoutForm({ workout }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const defaultDatetime = () => {
    const d = new Date(workout.started_at);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const name = form.elements.name.value;
    const startedAt = new Date(form.elements.started_at.value).toISOString();

    try {
      await updateWorkoutAction(workout.id, name, startedAt);
      router.push(`/dashboard?date=${startedAt.slice(0, 10)}`);
    } catch (err) {
      setError(err.message ?? "Something went wrong");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Workout name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Push day"
            defaultValue={workout.name ?? ""}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="started_at">Start time</Label>
          <Input
            id="started_at"
            name="started_at"
            type="datetime-local"
            defaultValue={defaultDatetime()}
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
            Cancel
          </Button>
        </div>
      </form>

      <ExerciseSection workoutId={workout.id} exercises={workout.exercises} router={router} />
    </div>
  );
}

function ExerciseSection({ workoutId, exercises, router }) {
  const [exerciseName, setExerciseName] = useState("");
  const [addingExercise, setAddingExercise] = useState(false);
  const [exerciseError, setExerciseError] = useState(null);

  async function handleAddExercise(e) {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    setAddingExercise(true);
    setExerciseError(null);

    try {
      await addExerciseAction(workoutId, exerciseName.trim());
      setExerciseName("");
      router.refresh();
    } catch (err) {
      setExerciseError(err.message ?? "Failed to add exercise");
    } finally {
      setAddingExercise(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Exercises</h2>

      {exercises.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No exercises added yet.</p>
      )}

      {exercises.map((ex) => (
        <ExerciseCard key={ex.workoutExerciseId} exercise={ex} router={router} />
      ))}

      <form onSubmit={handleAddExercise} className="flex gap-2 mt-2">
        <Input
          placeholder="Exercise name (e.g. Bench Press)"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          required
        />
        <Button type="submit" disabled={addingExercise}>
          {addingExercise ? "Adding…" : "Add exercise"}
        </Button>
      </form>
      {exerciseError && <p className="text-sm text-red-500">{exerciseError}</p>}
    </div>
  );
}

function ExerciseCard({ exercise, router }) {
  const [showSetForm, setShowSetForm] = useState(false);
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [addingSet, setAddingSet] = useState(false);
  const [setError, setSetError] = useState(null);

  async function handleAddSet(e) {
    e.preventDefault();
    setAddingSet(true);
    setSetError(null);

    try {
      await addSetAction(exercise.workoutExerciseId, reps, weight, unit);
      setReps("");
      setWeight("");
      setShowSetForm(false);
      router.refresh();
    } catch (err) {
      setSetError(err.message ?? "Failed to add set");
    } finally {
      setAddingSet(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{exercise.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {exercise.sets.length > 0 && (
          <table className="w-full text-xs text-zinc-600 dark:text-zinc-400">
            <thead>
              <tr className="text-left text-zinc-400 dark:text-zinc-500">
                <th className="pr-4 pb-1 font-normal">Set</th>
                <th className="pr-4 pb-1 font-normal">Reps</th>
                <th className="pb-1 font-normal">Weight</th>
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set) => (
                <tr key={set.id}>
                  <td className="pr-4">{set.set_number}</td>
                  <td className="pr-4">{set.reps}</td>
                  <td>{set.weight} {set.weight_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showSetForm ? (
          <form onSubmit={handleAddSet} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="Reps"
                type="number"
                min="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                required
                className="w-24"
              />
              <Input
                placeholder="Weight"
                type="number"
                min="0"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-28"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {setError && <p className="text-xs text-red-500">{setError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addingSet}>
                {addingSet ? "Adding…" : "Add set"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowSetForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setShowSetForm(true)}>
            + Add set
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
