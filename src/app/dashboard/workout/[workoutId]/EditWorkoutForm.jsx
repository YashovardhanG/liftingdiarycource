"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "./actions";

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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
