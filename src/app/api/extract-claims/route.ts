import { NextResponse } from "next/server";
import {
  extractClaims,
  apiRateLimiter,
  rateLimitResponse,
  ExtractClaimsSchema,
  formatValidationError,
} from "@/lib";

/**
 * POST /api/extract-claims
 *
 * Next.js App Router API route that extracts individual factual claims
 * from a clinical note. The handler enforces rate limiting, validates
 * the incoming payload with a Zod schema, and delegates to the
 * extractClaims library function (which uses an LLM to decompose the
 * note into discrete, verifiable claims).
 *
 * Security considerations:
 *   - Rate limiting is checked before any body parsing to protect
 *     against abuse.
 *   - Input is validated with Zod (ExtractClaimsSchema) instead of
 *     manual checks.
 *   - Internal error details are never forwarded to the client; only a
 *     generic message is returned while the full error is logged
 *     server-side.
 *
 * Inputs:
 *   - Request body (JSON): An object containing:
 *       - note (string): The clinical note text to extract claims from.
 *         Must be a non-empty string.
 *
 * Expected outputs:
 *   - 200 OK: JSON object { claims: Claim[] } -- the array of extracted
 *     claims, each with text and metadata as defined by the Claim type.
 *   - 400 Bad Request: JSON object { error: string } -- returned when
 *     the JSON is malformed or the payload fails schema validation.
 *   - 429 Too Many Requests: Rate limit exceeded; includes Retry-After
 *     header and remaining request count.
 *   - 500 Internal Server Error: JSON object { error: string } --
 *     returned with a generic message when an unexpected error occurs.
 *
 * @param request - The incoming Next.js Request object.
 * @returns A NextResponse containing the extracted claims or an error.
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
    const result = ExtractClaimsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatValidationError(result.error) },
        { status: 400 },
      );
    }

    const data = result.data;

    // Step 4: Extract claims from the validated note
    const claims = await extractClaims(data.note);

    // Step 5: Return the extracted claims
    return NextResponse.json({ claims }, { status: 200 });
  } catch (error: unknown) {
    // Step 6: Log the full error server-side; return a generic message
    console.error("[extract-claims] Error:", error);

    return NextResponse.json(
      {
        error:
          "An error occurred during claim extraction. Please try again.",
      },
      { status: 500 },
    );
  }
}
