import { NextResponse } from "next/server";

/**
 * Represents a single rate-limit tracking entry for an IP address.
 * `count` is the number of requests made in the current window.
 * `resetTime` is the Unix timestamp (ms) when the window expires.
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Configuration options for creating a rate limiter instance.
 * `maxRequests` controls how many requests an IP may make per window.
 * `windowMs` controls the duration of each rate-limit window in milliseconds.
 */
interface RateLimiterOptions {
  maxRequests?: number;
  windowMs?: number;
}

/**
 * The result returned after checking whether a request is allowed.
 * `allowed` indicates if the request should proceed.
 * `retryAfter` is the number of seconds until the window resets (present when blocked).
 * `remaining` is how many requests the client has left in the current window.
 */
interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining: number;
}

/**
 * Extracts the client IP address from the incoming request headers.
 * Checks `x-forwarded-for` first (takes the first IP in the comma-separated list),
 * then falls back to `x-real-ip`, and finally defaults to "unknown" if neither
 * header is present.
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Creates an in-memory IP-based rate limiter for Next.js API routes.
 *
 * The returned object exposes a `check` method that tracks requests per IP
 * using a Map. Stale entries (whose window has expired) are cleaned up on
 * every call to `check`, preventing unbounded memory growth.
 *
 * @param options.maxRequests - Maximum requests allowed per window (default: 10)
 * @param options.windowMs   - Window duration in milliseconds (default: 60,000)
 * @returns An object with `check(request)` and the resolved `maxRequests` / `windowMs` values
 */
function createRateLimiter(options: RateLimiterOptions = {}) {
  const maxRequests = options.maxRequests ?? 10;
  const windowMs = options.windowMs ?? 60_000;

  /**
   * In-memory store mapping each IP address to its current request count
   * and the timestamp at which its rate-limit window resets.
   */
  const store: Map<string, RateLimitEntry> = new Map();

  /**
   * Removes all entries from the store whose `resetTime` is in the past.
   * Called on every rate-limit check to prevent the Map from growing
   * indefinitely with stale data.
   */
  function cleanupStaleEntries(): void {
    const now = Date.now();
    for (const [ip, entry] of store) {
      if (entry.resetTime <= now) {
        store.delete(ip);
      }
    }
  }

  /**
   * Checks whether the incoming request is allowed under the rate limit.
   *
   * Extracts the client IP, cleans up stale entries, and either creates a
   * new window or increments the existing counter. Returns an object
   * indicating whether the request is allowed, how many requests remain,
   * and (if blocked) how many seconds until the window resets.
   *
   * @param request - The incoming Request object from a Next.js API route
   * @returns A RateLimitResult with `allowed`, `remaining`, and optionally `retryAfter`
   */
  function check(request: Request): RateLimitResult {
    cleanupStaleEntries();

    const ip = getClientIp(request);
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || entry.resetTime <= now) {
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return { allowed: false, retryAfter, remaining: 0 };
    }

    return { allowed: true, remaining: maxRequests - entry.count };
  }

  return { check, maxRequests, windowMs };
}

/**
 * Evaluates whether the given request is within the rate limit using the
 * provided rate limiter instance. This is the primary entry point for
 * rate-limit checks in API route handlers.
 *
 * @param request     - The incoming Request object
 * @param rateLimiter - A rate limiter instance created by `createRateLimiter` (defaults to `apiRateLimiter`)
 * @returns A RateLimitResult indicating if the request is allowed
 */
function checkRateLimit(
  request: Request,
  rateLimiter = apiRateLimiter
): RateLimitResult {
  return rateLimiter.check(request);
}

/**
 * Builds a standardised 429 "Too Many Requests" NextResponse.
 *
 * The response includes a JSON body with an error message, plus the
 * standard rate-limit headers:
 *   - `Retry-After`           : seconds until the client may retry
 *   - `X-RateLimit-Limit`     : maximum requests allowed per window
 *   - `X-RateLimit-Remaining` : requests remaining (always 0 when blocked)
 *   - `X-RateLimit-Reset`     : seconds until the current window resets
 *
 * @param retryAfter  - Seconds until the rate-limit window resets (default: 60)
 * @param maxRequests - The configured maximum requests per window (default: 10)
 * @returns A NextResponse with 429 status and appropriate headers
 */
function rateLimitResponse(
  retryAfter: number = 60,
  maxRequests: number = 10
): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(retryAfter),
      },
    }
  );
}

/**
 * Default rate limiter instance configured for general API route protection.
 * Allows 10 requests per 60-second window per IP address.
 */
const apiRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
});

export {
  createRateLimiter,
  checkRateLimit,
  rateLimitResponse,
  apiRateLimiter,
};
export type { RateLimitResult, RateLimiterOptions, RateLimitEntry };
