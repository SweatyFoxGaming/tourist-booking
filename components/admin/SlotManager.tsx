"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
};

export default function SlotManagerPage({
  activityId,
  activityTitle,
}: {
  activityId: string;
  activityTitle: string;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState({
    date: "",
    time: "09:00",
    capacity: "10",
  });
  const [loading, setLoading] = useState(false);

  function loadSlots() {
    fetch(`/api/activities/${activityId}/slots`)
      .then((r) => r.json())
      .then(setSlots);
  }

  useEffect(() => {
    loadSlots();
  }, [activityId]);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const startTime = new Date(`${newSlot.date}T${newSlot.time}`);

    await fetch(`/api/activities/${activityId}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: startTime.toISOString(),
        capacity: parseInt(newSlot.capacity, 10),
      }),
    });

    setNewSlot({ date: "", time: "09:00", capacity: "10" });
    loadSlots();
    setLoading(false);
  }

  async function deleteSlot(slotId: string) {
    if (!confirm("Delete this slot?")) return;
    await fetch(`/api/activities/${activityId}/slots?slotId=${slotId}`, {
      method: "DELETE",
    });
    loadSlots();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Manage Slots</h1>
      <p className="text-slate-300">{activityTitle}</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Add Availability Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addSlot} className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Start Time</Label>
              <Input
                id="time"
                type="time"
                value={newSlot.time}
                onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={newSlot.capacity}
                onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                required
                className="mt-1 w-24"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Add Slot
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upcoming Slots ({slots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length > 0 ? (
            <div className="space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-[var(--radius)] border border-slate-700 p-3"
                >
                  <div>
                    <p className="font-medium text-white">
                      {format(new Date(slot.startTime), "EEE, MMM d yyyy · h:mm a")}
                    </p>
                    <p className="text-sm text-slate-400">
                      {slot.bookedCount}/{slot.capacity} booked
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSlot(slot.id)}
                    disabled={slot.bookedCount > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No upcoming slots.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
