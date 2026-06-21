"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { asStringArray } from "@/lib/utils";

type ActivityFormProps = {
  activityId?: string;
};

export default function ActivityForm({ activityId }: ActivityFormProps) {
  const router = useRouter();
  const isEdit = !!activityId;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    duration: "120",
    price: "",
    category: "",
    images: "",
    cancellationPolicy:
      "Free cancellation up to 24 hours before the activity start time.",
    cancellationHours: "24",
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activityId) {
      fetch(`/api/activities/${activityId}`)
        .then((r) => r.json())
        .then((data) => {
          const images = asStringArray(data.images);
          setForm({
            title: data.title,
            slug: data.slug,
            description: data.description,
            location: data.location,
            duration: String(data.duration),
            price: String(data.price),
            category: data.category,
            images: images.join("\n"),
            cancellationPolicy: data.cancellationPolicy ?? form.cancellationPolicy,
            cancellationHours: String(data.cancellationHours ?? 24),
            isPublished: data.isPublished,
          });
        });
    }
  }, [activityId]);

  function addImageUrl(url: string) {
    setForm((prev) => ({
      ...prev,
      images: prev.images ? `${prev.images}\n${url}` : url,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      duration: parseInt(form.duration, 10),
      price: parseFloat(form.price),
      cancellationHours: parseInt(form.cancellationHours, 10),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    const res = await fetch(
      isEdit ? `/api/activities/${activityId}` : "/api/activities",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      setError("Failed to save activity");
      setLoading(false);
      return;
    }

    router.push("/admin/activities");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">
        {isEdit ? "Edit Activity" : "New Activity"}
      </h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="images">Images (one URL per line)</Label>
                <ImageUpload onUploaded={addImageUrl} />
              </div>
              <Textarea
                id="images"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                rows={3}
                className="mt-1"
                placeholder="https://images.unsplash.com/... or upload above"
              />
            </div>
            <div>
              <Label htmlFor="cancellationHours">Cancellation window</Label>
              <Select
                value={form.cancellationHours}
                onValueChange={(v) => setForm({ ...form, cancellationHours: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Non-refundable</SelectItem>
                  <SelectItem value="24">24 hours before</SelectItem>
                  <SelectItem value="48">48 hours before</SelectItem>
                  <SelectItem value="72">72 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cancellationPolicy">Cancellation policy text</Label>
              <Textarea
                id="cancellationPolicy"
                value={form.cancellationPolicy}
                onChange={(e) =>
                  setForm({ ...form, cancellationPolicy: e.target.value })
                }
                rows={2}
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              <span className="text-sm">Published</span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Activity"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
