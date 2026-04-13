import { NextResponse } from "next/server";
import { verifyClaims, VerifyClaimsRequest } from "@/lib";

/**
 * POST /api/verify-claims
 *
 * Next.js App Router API route that verifies an array of extracted claims
 * against a source transcript. It receives the claims and transcript in
 * the request body, validates them, and delegates to the verifyClaims
 * library function, which uses an LLM to assess each claim as grounded,
 * partially grounded, or ungrounded relative to the transcript.
 *
 * Inputs:
 *   - Request body (JSON): A VerifyClaimsRequest object containing:
 *       - claims (array): A non-empty array of claim objects to verify.
 *       - transcript (string): The source transcript to verify claims
 *         against. Must be a non-empty string.
 *
 * Expected outputs:
 *   - 200 OK: JSON object { verified_claims: VerifiedClaim[] } — the
 *     array of claims augmented with verification status and reasoning.
 *   - 400 Bad Request: JSON object { error: string } — returned when
 *     the claims array is missing/empty or the transcript is missing/empty.
 *   - 500 Internal Server Error: JSON object { error: string } — returned
 *     when an unexpected error occurs during claim verification.
 *
 * @param request - The incoming Next.js Request object.
 * @returns A NextResponse containing the verified claims or an error.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: VerifyClaimsRequest = await request.json();

    if (!Array.isArray(body.claims) || body.claims.length === 0) {
      return NextResponse.json(
        { error: "The 'claims' field is required and must be a non-empty array." },
        { status: 400 }
      );
    }

    if (
      !body.transcript ||
      typeof body.transcript !== "string" ||
      body.transcript.trim() === ""
    ) {
      return NextResponse.json(
        { error: "The 'transcript' field is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const verified_claims = await verifyClaims(body.claims, body.transcript);

    return NextResponse.json({ verified_claims });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("[verify-claims] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
