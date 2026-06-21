"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
};

export function ReviewSection({
  activityId,
  reviews,
}: {
  activityId: string;
  reviews: Review[];
}) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-[var(--color-text)]">
        Reviews ({reviews.length})
      </h2>

      {reviews.length > 0 ? (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
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
                  <span className="font-medium">{review.userName}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No reviews yet. Be the first after booking!</p>
      )}
    </section>
  );
}

export function ReviewForm({
  bookingId,
  onSubmitted,
}: {
  bookingId: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to submit review");
      setLoading(false);
      return;
    }

    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-[var(--radius)] border p-4">
      <h4 className="font-medium">Leave a Review</h4>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            className="p-1"
          >
            <Star
              className={`h-6 w-6 ${
                i < rating
                  ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        required
        className="w-full rounded-[var(--radius)] border border-gray-300 p-3 text-sm"
        rows={3}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
