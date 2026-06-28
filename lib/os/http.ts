import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/os/rate-limit";
import type { RateLimitOptions, RateLimitResult } from "@/lib/os/rate-limit";

export function enforceRateLimit(
  request: Request,
  scope: string,
  options: RateLimitOptions
): RateLimitResult | NextResponse {
  const result = checkRateLimit(`${scope}:${getClientIp(request)}`, options);

  if (result.allowed) {
    return result;
  }

  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
      },
    }
  );
}
