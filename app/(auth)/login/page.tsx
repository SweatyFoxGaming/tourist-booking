import { Suspense } from "react";
import LoginPage from "./login-page";

export default function LoginPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-64 w-full max-w-md animate-pulse rounded-[var(--radius)] bg-gray-200" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
