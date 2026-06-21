import { Suspense } from "react";
import { ThemedHeader, ThemedFooter } from "@/components/layout/ThemedHeader";
import { getSiteTheme } from "@/lib/theme-server";

function AuthPagesFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-64 w-full max-w-md animate-pulse rounded-[var(--radius)] bg-gray-200" />
    </div>
  );
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getSiteTheme();

  return (
    <>
      <ThemedHeader theme={theme} />
      <main className="flex-1">
        <Suspense fallback={<AuthPagesFallback />}>{children}</Suspense>
      </main>
      <ThemedFooter />
    </>
  );
}
