"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-bold text-white">Admin dashboard error</h1>
      <p className="mt-3 text-sm text-slate-300">
        Something went wrong loading analytics. This is often fixed by restarting the dev
        server after database changes.
      </p>
      <p className="mt-4 rounded-lg bg-slate-900 px-4 py-3 font-mono text-xs text-red-300">
        {error.message}
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/admin/bookings">Open bookings</Link>
        </Button>
      </div>
    </div>
  );
}
