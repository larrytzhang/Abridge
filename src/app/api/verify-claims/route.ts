import { NextResponse } from "next/server";
import {
  verifyClaims,
  apiRateLimiter,
  rateLimitResponse,
  VerifyClaimsSchema,
  formatValidationError,
} from "@/lib";

/**
 * POST /api/verify-claims
 *
 * Next.js App Router API route that verifies an array of extracted claims
 * against a source transcript. The handler enforces rate limiting,
 * validates the incoming payload with a Zod schema, and delegates to the
 * verifyClaims library function (which uses an LLM to assess each claim
 * as grounded, partially grounded, or ungrounded relative to the
 * transcript).
 *
 * Security considerations:
 *   - Rate limiting is checked before any body parsing to protect
 *     against abuse.
 *   - Input is validated with Zod (VerifyClaimsSchema) instead of
 *     manual checks.
 *   - Internal error details are never forwarded to the client; only a
 *     generic message is returned while the full error is logged
 *     server-side.
 *
 * Inputs:
 *   - Request body (JSON): An object containing:
 *       - claims (array): A non-empty array of claim objects to verify.
 *       - transcript (string): The source transcript to verify claims
 *         against. Must be a non-empty string.
 *
 * Expected outputs:
 *   - 200 OK: JSON object { verified_claims: VerifiedClaim[] } -- the
 *     array of claims augmented with verification status and reasoning.
 *   - 400 Bad Request: JSON object { error: string } -- returned when
 *     the JSON is malformed or the payload fails schema validation.
 *   - 429 Too Many Requests: Rate limit exceeded; includes Retry-After
 *     header and remaining request count.
 *   - 500 Internal Server Error: JSON object { error: string } --
 *     returned with a generic message when an unexpected error occurs.
 *
 * @param request - The incoming Next.js Request object.
 * @returns A NextResponse containing the verified claims or an error.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Step 1: Rate limit check
    const { allowed, retryAfter } = apiRateLimiter.check(request);

    if (!allowed) {
      return rateLimitResponse(retryAfter);
    }

    // Step 2: Parse the request body as JSON
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Step 3: Validate with Zod schema
    const result = VerifyClaimsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatValidationError(result.error) },
        { status: 400 },
      );
    }

    const data = result.data;

    // Step 4: Verify claims against the transcript
    const verified_claims = await verifyClaims(data.claims, data.transcript);

    // Step 5: Return the verified claims
    return NextResponse.json({ verified_claims }, { status: 200 });
  } catch (error: unknown) {
    // Step 6: Log the full error server-side; return a generic message
    console.error("[verify-claims] Error:", error);

    return NextResponse.json(
      {
        error:
          "An error occurred during claim verification. Please try again.",
      },
      { status: 500 },
    );
  }
}
