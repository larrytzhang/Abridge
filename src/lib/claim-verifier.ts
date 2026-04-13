import openai from "./openai";
import {
  VERIFICATION_SYSTEM_PROMPT,
  buildVerificationUserPrompt,
  VERIFY_CLAIMS_SCHEMA,
} from "./prompts";
import type { Claim, VerifiedClaim } from "./types";

/**
 * Verifies a list of clinical claims against a source transcript.
 *
 * This function takes claims previously extracted from a clinical note and
 * cross-references each one against the original doctor-patient transcript.
 * For every claim, the model determines whether it is:
 *   - "supported"     : clearly backed by evidence in the transcript
 *   - "not_supported" : contradicted by or absent from the transcript
 *   - "not_mentioned" : neither confirmed nor denied in the transcript
 *
 * The model is called with a slightly higher temperature (0.2) than claim
 * extraction to allow nuanced judgment when evidence is ambiguous. A JSON
 * Schema response format is enforced to guarantee well-structured output.
 *
 * @param claims     - An array of Claim objects to verify. These are
 *                     typically produced by the extractClaims function.
 * @param transcript - The full text of the original doctor-patient
 *                     conversation transcript used as the ground truth.
 *
 * @returns A promise that resolves to an array of VerifiedClaim objects.
 *          Each VerifiedClaim extends the original Claim with a verification
 *          status and an explanation of the reasoning.
 *
 * @throws Will throw if the OpenAI API call fails or if the response body
 *         cannot be parsed as valid JSON matching the expected schema.
 *
 * @example
 *   const verified = await verifyClaims(claims, transcriptText);
 *   // => [{ text: "...", status: "supported", explanation: "..." }, ...]
 */
export async function verifyClaims(
  claims: Claim[],
  transcript: string
): Promise<VerifiedClaim[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: VERIFY_CLAIMS_SCHEMA,
    },
    messages: [
      { role: "system", content: VERIFICATION_SYSTEM_PROMPT },
      { role: "user", content: buildVerificationUserPrompt(claims, transcript) },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Claim verification failed: no content returned from OpenAI"
    );
  }

  const parsed = JSON.parse(content);
  return parsed.verified_claims as VerifiedClaim[];
}
