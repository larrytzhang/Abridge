import { NextResponse } from "next/server";
import { extractClaims, ExtractClaimsRequest } from "@/lib";

/**
 * POST /api/extract-claims
 *
 * Next.js App Router API route that extracts individual factual claims
 * from a clinical note. It receives the note text in the request body,
 * validates it, and delegates to the extractClaims library function,
 * which uses an LLM to decompose the note into discrete, verifiable
 * claims.
 *
 * Inputs:
 *   - Request body (JSON): An ExtractClaimsRequest object containing:
 *       - note (string): The clinical note text to extract claims from.
 *         Must be a non-empty string.
 *
 * Expected outputs:
 *   - 200 OK: JSON object { claims: Claim[] } — the array of extracted
 *     claims, each with text and metadata as defined by the Claim type.
 *   - 400 Bad Request: JSON object { error: string } — returned when the
 *     "note" field is missing or empty.
 *   - 500 Internal Server Error: JSON object { error: string } — returned
 *     when an unexpected error occurs during claim extraction.
 *
 * @param request - The incoming Next.js Request object.
 * @returns A NextResponse containing the extracted claims or an error.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: ExtractClaimsRequest = await request.json();

    if (!body.note || typeof body.note !== "string" || body.note.trim() === "") {
      return NextResponse.json(
        { error: "The 'note' field is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const claims = await extractClaims(body.note);

    return NextResponse.json({ claims });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("[extract-claims] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
