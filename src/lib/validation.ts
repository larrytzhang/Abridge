import { z } from "zod/v4";

/**
 * Zod schema for validating the request body of the extract-claims API endpoint.
 *
 * Expects an object with a single `note` field containing the clinical note text.
 * The note must be a non-empty string no longer than 50,000 characters.
 * Uses `.strict()` to reject any unexpected fields in the request body.
 */
const ExtractClaimsSchema = z
  .object({
    note: z
      .string()
      .min(1, "Note is required")
      .max(50_000, "Note exceeds 50,000 character limit"),
  })
  .strict();

/**
 * Zod schema for validating the request body of the verify-claims API endpoint.
 *
 * Expects an object with:
 *   - `claims`: an array of 1-200 claim objects, each containing an `id`, `text`,
 *     a SOAP `section` (subjective/objective/assessment/plan), and a clinical
 *     `category` (patient_statement, physical_finding, vital_sign, symptom,
 *     diagnosis, medication, plan_action, history, temporal, negation, inference).
 *   - `transcript`: a non-empty string up to 100,000 characters containing the
 *     source transcript to verify claims against.
 *
 * Both the outer object and each claim object use `.strict()` to reject
 * unexpected fields.
 */
const VerifyClaimsSchema = z
  .object({
    claims: z
      .array(
        z
          .object({
            id: z.string(),
            text: z.string(),
            section: z.enum([
              "subjective",
              "objective",
              "assessment",
              "plan",
            ]),
            category: z.enum([
              "patient_statement",
              "physical_finding",
              "vital_sign",
              "symptom",
              "diagnosis",
              "medication",
              "plan_action",
              "history",
              "temporal",
              "negation",
              "inference",
            ]),
          })
          .strict()
      )
      .min(1, "At least one claim is required")
      .max(200, "Maximum 200 claims allowed"),
    transcript: z
      .string()
      .min(1, "Transcript is required")
      .max(100_000, "Transcript exceeds 100,000 character limit"),
  })
  .strict();

/**
 * Formats a Zod validation error into a clean, user-friendly error message.
 *
 * Extracts the message from the first issue in the ZodError's `issues` array.
 * This provides a single, actionable error string suitable for returning in
 * API error responses rather than exposing the full Zod error structure.
 *
 * @param error - The ZodError thrown by a failed `.parse()` or returned by `.safeParse()`
 * @returns A human-readable string describing the first validation failure
 */
function formatValidationError(error: z.ZodError): string {
  return error.issues[0].message;
}

export { ExtractClaimsSchema, VerifyClaimsSchema, formatValidationError };
