import openai from "./openai";
import {
  CLAIM_EXTRACTION_SYSTEM_PROMPT,
  buildClaimExtractionUserPrompt,
  EXTRACT_CLAIMS_SCHEMA,
} from "./prompts";
import type { Claim } from "./types";

/**
 * Extracts discrete, verifiable clinical claims from a medical note.
 *
 * This function sends the full text of a clinical note to OpenAI's GPT-4o
 * model and receives back a structured list of individual claims. Each claim
 * represents a single factual assertion found in the note (e.g., a diagnosis,
 * medication, vital sign, or procedure) that can later be cross-checked
 * against a source transcript for hallucination detection.
 *
 * The model is called with a low temperature (0.1) to encourage deterministic,
 * faithful extraction rather than creative generation. A JSON Schema
 * response format is enforced to guarantee well-structured output.
 *
 * @param note - The full text of the clinical note to extract claims from.
 *               This is typically an AI-generated note that needs to be
 *               verified for accuracy.
 *
 * @returns A promise that resolves to an array of Claim objects, each
 *          containing the extracted claim text and its category/metadata.
 *
 * @throws Will throw if the OpenAI API call fails or if the response body
 *         cannot be parsed as valid JSON matching the expected schema.
 *
 * @example
 *   const claims = await extractClaims("Patient presents with chest pain...");
 *   // => [{ text: "Patient presents with chest pain", category: "symptom" }, ...]
 */
export async function extractClaims(note: string): Promise<Claim[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    response_format: {
      type: "json_schema",
      json_schema: EXTRACT_CLAIMS_SCHEMA,
    },
    messages: [
      { role: "system", content: CLAIM_EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: buildClaimExtractionUserPrompt(note) },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Claim extraction failed: no content returned from OpenAI"
    );
  }

  const parsed = JSON.parse(content);
  return parsed.claims as Claim[];
}
