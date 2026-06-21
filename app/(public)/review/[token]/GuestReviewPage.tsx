"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function GuestReviewPage({ token }: { token: string }) {
  const router = useRouter();
  const [activityTitle, setActivityTitle] = useState("");
  const [hasReview, setHasReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews/guest?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setActivityTitle(data.activityTitle);
          setHasReview(data.hasReview);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, rating, comment }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to submit review");
      setSubmitting(false);
      return;
    }

    router.push("/activities?reviewed=true");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="h-64 animate-pulse rounded-[var(--radius)] bg-gray-200" />
      </div>
    );
  }

  if (error && !activityTitle) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Review unavailable</h1>
        <p className="mt-2 text-gray-500">{error}</p>
        <Button className="mt-6" asChild>
          <Link href="/activities">Browse Activities</Link>
        </Button>
      </div>
    );
  }

  if (hasReview) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Thank you!</h1>
        <p className="mt-2 text-gray-500">You&apos;ve already reviewed {activityTitle}.</p>
        <Button className="mt-6" asChild>
          <Link href={`/activities`}>Back to Activities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Review: {activityTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)}>
                  <Star
                    className={`h-8 w-8 ${
                      i < rating
                        ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              required
              rows={4}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
