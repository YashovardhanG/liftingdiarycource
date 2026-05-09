"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";

export default function NewWorkoutForm({ defaultDate }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const name = form.elements.name.value;
    const startedAt = new Date(form.elements.started_at.value).toISOString();

    try {
      await createWorkoutAction(name, startedAt);
      const dateParam = defaultDate ?? startedAt.slice(0, 10);
      router.push(`/dashboard?date=${dateParam}`);
    } catch (err) {
      setError(err.message ?? "Something went wrong");
      setPending(false);
    }
  }

  const defaultDatetime = () => {
    const base = defaultDate ? new Date(`${defaultDate}T09:00:00`) : new Date();
    base.setSeconds(0, 0);
    return base.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Push day"
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
          {pending ? "Creating…" : "Create workout"}
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
