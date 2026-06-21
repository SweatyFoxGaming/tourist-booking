import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-[var(--color-primary)]">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">Page not found</h1>
      <p className="mt-2 max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/activities">Browse Activities</Link>
        </Button>
      </div>
    </div>
  );
}
