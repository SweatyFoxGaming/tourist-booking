"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  guestName?: string | null;
  user?: { name: string | null; email: string } | null;
  activity: { title: string };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews?admin=true")
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  async function toggleVisibility(id: string, isVisible: boolean) {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVisible: !isVisible }),
    });
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isVisible: !isVisible } : r))
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews</h1>
      <p className="text-gray-500">Moderate customer reviews</p>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-[var(--radius)] bg-gray-200" />
      ) : reviews.length > 0 ? (
        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-[var(--radius)] border bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {review.user?.name ?? review.guestName ?? "Guest"}
                    </span>
                    <Badge variant={review.isVisible ? "success" : "outline"}>
                      {review.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{review.activity.title}</p>
                  <p className="mt-2 text-gray-600">{review.comment}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleVisibility(review.id, review.isVisible)}
                >
                  {review.isVisible ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
}
