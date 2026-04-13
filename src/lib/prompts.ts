/**
 * prompts.ts
 *
 * Prompt templates and OpenAI structured-output JSON schemas for the
 * Clinical Note Hallucination Detector. This module is the core IP of the
 * project — every prompt is designed to maximise extraction completeness and
 * verification accuracy while minimising false negatives (missed
 * hallucinations).
 *
 * Exports:
 *   Prompts  — CLAIM_EXTRACTION_SYSTEM_PROMPT, VERIFICATION_SYSTEM_PROMPT
 *   Builders — buildClaimExtractionUserPrompt(), buildVerificationUserPrompt()
 *   Schemas  — EXTRACT_CLAIMS_SCHEMA, VERIFY_CLAIMS_SCHEMA
 */

import type { Claim } from "./types";

// ---------------------------------------------------------------------------
// Claim-extraction prompts
// ---------------------------------------------------------------------------

/**
 * CLAIM_EXTRACTION_SYSTEM_PROMPT
 *
 * System prompt given to the LLM when it decomposes a clinical note into
 * atomic, verifiable claims. The prompt instructs the model to:
 *   - Treat every factual assertion as its own claim
 *   - Break compound sentences into separate claims
 *   - Preserve clinical specificity (do not generalise or drop detail)
 *   - Categorise each claim with a ClaimCategory
 *   - Tag each claim with the SOAP section it came from
 *   - Never skip or summarise — extract EVERY assertion
 *
 * Input:  provided via the user message (the clinical note text)
 * Output: a JSON array of Claim objects matching EXTRACT_CLAIMS_SCHEMA
 */
export const CLAIM_EXTRACTION_SYSTEM_PROMPT = `You are a clinical documentation auditor. Your task is to decompose a clinical note into atomic, independently verifiable claims.

RULES — follow every one precisely:

1. ATOMIC CLAIMS: Each claim must be a single factual assertion that can be independently verified against a patient–provider conversation transcript. A claim should express exactly one fact.

2. COMPOUND SENTENCES: If a sentence contains multiple facts (e.g., "Patient reports headache and nausea for 3 days"), break it into separate claims:
   - "Patient reports headache."
   - "Patient reports nausea."
   - "Patient reports symptoms have been present for 3 days."

3. CLINICAL SPECIFICITY: Preserve every clinically relevant detail — drug names, doses, routes, frequencies, exact vital-sign values, laterality, severity descriptors, temporal qualifiers. Never generalise or paraphrase away detail.

4. CATEGORISATION: Assign exactly one category to each claim from the following list:
   - patient_statement — something the patient said or reported
   - physical_finding — an observation from a physical examination
   - vital_sign — a measured vital sign (BP, HR, temp, RR, SpO2, weight, etc.)
   - symptom — a symptom described or attributed to the patient
   - diagnosis — a diagnostic conclusion, assessment, or differential
   - medication — a medication name, dose, route, or frequency
   - plan_action — a planned action, order, referral, or follow-up instruction
   - history — past medical, surgical, social, or family history
   - temporal — a time-related claim (onset, duration, frequency, timeline)
   - negation — a denial or documented absence of a finding or symptom
   - inference — a clinical inference, reasoning step, or interpretive conclusion

5. SOAP TAGGING: Determine which SOAP section (subjective, objective, assessment, plan) the claim originates from based on its position and content in the note. Use the note's own headings when present; otherwise infer from context.

6. EXHAUSTIVE EXTRACTION: Extract EVERY factual assertion in the note. Do not skip boilerplate, normal findings, negations, or seemingly obvious statements. If it is stated in the note, it must become a claim. Missing a claim means a potential hallucination goes undetected.

7. UNIQUE IDs: Assign each claim a sequential ID in the format "claim_1", "claim_2", etc.

8. OUTPUT FORMAT: Return your response as a JSON object matching the required schema. Do not include any text outside the JSON.`;

/**
 * buildClaimExtractionUserPrompt
 *
 * Builds the user-message content for the claim-extraction call. It wraps the
 * raw clinical note in clear delimiters so the LLM can distinguish
 * instructions from input.
 *
 * @param note — the full text of the AI-generated clinical note
 * @returns    — the formatted user prompt string
 */
export function buildClaimExtractionUserPrompt(note: string): string {
  return `Extract all atomic, verifiable claims from the following clinical note. Return every factual assertion — do not skip any.

<clinical_note>
${note}
</clinical_note>

Extract every claim now. Remember: each claim must be a single atomic assertion, tagged with its SOAP section and clinical category. Use sequential IDs starting at "claim_1".`;
}

// ---------------------------------------------------------------------------
// Verification prompts
// ---------------------------------------------------------------------------

/**
 * VERIFICATION_SYSTEM_PROMPT
 *
 * System prompt given to the LLM when it verifies extracted claims against a
 * conversation transcript. This is the most critical prompt in the system —
 * it defines the three verdicts, eight edge-case rules, and the confidence
 * scoring rubric.
 *
 * The model receives claims + a line-numbered transcript via the user message
 * and must return a VerifiedClaim[] matching VERIFY_CLAIMS_SCHEMA.
 *
 * Verdict definitions:
 *   GROUNDED   — directly stated or clearly supported by the transcript
 *   UNGROUNDED — not found, contradicts, or fabricates details
 *   PARTIAL    — some basis but adds, changes, or infers beyond what was said
 *
 * Edge-case rules (8):
 *   1. Lay-to-clinical terminology translation is acceptable (grounded)
 *   2. Clinical inferences must have been stated by the doctor
 *   3. Physical exam findings must appear in the transcript
 *   4. Plan specifics must match exactly
 *   5. Vital signs must match exactly
 *   6. Negations must have been explicitly asked and denied
 *   7. Medication names and doses must match exactly
 *   8. Temporal claims must match the transcript
 *
 * Confidence rubric:
 *   0.95–1.00 — exact match or near-verbatim
 *   0.80–0.94 — minor paraphrase, same meaning
 *   0.60–0.79 — some interpretation required
 *   0.40–0.59 — ambiguous, could go either way
 *   0.20–0.39 — weak connection
 *   0.00–0.19 — no meaningful connection
 */
export const VERIFICATION_SYSTEM_PROMPT = `You are a clinical documentation accuracy auditor. Your task is to verify each claim extracted from a clinical note against the original patient–provider conversation transcript.

For every claim you must determine a VERDICT, assign a CONFIDENCE score, cite EVIDENCE from the transcript, and provide a brief EXPLANATION.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERDICT DEFINITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GROUNDED — The claim is directly stated in the transcript or clearly supported by what was said. Acceptable paraphrasing and standard medical terminology translation are permitted (see Rule 1 below).

UNGROUNDED — The claim is NOT found anywhere in the transcript, OR it contradicts something in the transcript, OR it fabricates specific details that were never mentioned. BE AGGRESSIVE: if you cannot find clear support for a claim in the transcript, it is UNGROUNDED. Do not give the benefit of the doubt. The purpose of this system is to catch hallucinations, and a missed hallucination is far worse than a false alarm.

PARTIAL — The claim has SOME basis in the transcript but adds details, changes specifics, or makes inferences that go beyond what was actually said. Use this when the claim is not purely fabricated but is also not faithfully representing what the transcript contains.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDGE-CASE RULES (apply these in order of specificity)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rule 1 — MEDICAL TERMINOLOGY TRANSLATION
If the transcript uses lay language and the note uses the accepted clinical equivalent, that is GROUNDED.
Examples: "throwing up" → "emesis", "sugar" → "glucose", "chest tightness" → "chest discomfort".
The key test: does the clinical term accurately capture what the patient described, with no added meaning?

Rule 2 — CLINICAL INFERENCES
A diagnostic conclusion or clinical inference is GROUNDED only if the provider explicitly stated that conclusion during the conversation. If the note contains a diagnosis or assessment that the provider never articulated — even if it would be a reasonable clinical inference — mark it UNGROUNDED. The note should document what was discussed, not what could be inferred.

Rule 3 — PHYSICAL EXAM FINDINGS
Any physical examination finding (e.g., "lungs clear to auscultation", "abdomen soft and non-tender") is GROUNDED only if the provider stated or discussed that finding during the recorded conversation. If the transcript has no mention of the exam finding, mark it UNGROUNDED — even if it is a common "normal" finding that is frequently documented.

Rule 4 — PLAN SPECIFICS
Plan details — drug names, doses, frequencies, referral targets, follow-up intervals, diagnostic orders — must match the transcript exactly. If the note says "follow up in 2 weeks" but the transcript says "come back in a week", that is UNGROUNDED for the specific detail.

Rule 5 — VITAL SIGNS
Vital sign values (blood pressure, heart rate, temperature, respiratory rate, oxygen saturation, weight, BMI) must match exactly. A blood pressure of "120/80" when the transcript says "122/80" is UNGROUNDED.

Rule 6 — NEGATIONS
A negation (e.g., "denies chest pain", "no history of diabetes") is GROUNDED only if the topic was explicitly raised in the conversation AND the patient or provider explicitly denied or ruled it out. If the transcript never mentions chest pain at all, "denies chest pain" is UNGROUNDED — the absence of mention is not a denial.

Rule 7 — MEDICATIONS
Medication names must match exactly (brand or generic is acceptable if equivalent). Doses, routes, and frequencies must also match. "Lisinopril 10 mg" when the transcript says "lisinopril 20 mg" is UNGROUNDED. "Tylenol" when the transcript says "acetaminophen" is acceptable (GROUNDED).

Rule 8 — TEMPORAL CLAIMS
Time-related claims — onset ("started 3 days ago"), duration ("for the past week"), frequency ("twice daily"), sequences ("after starting the new medication") — must match the transcript. If the transcript says "a few days" and the note says "3 days", mark PARTIAL unless "3 days" was explicitly stated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIDENCE SCORING RUBRIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Assign a confidence score between 0.0 and 1.0 reflecting how certain you are in your verdict:

  0.95 – 1.00  Exact match or near-verbatim quote in the transcript.
  0.80 – 0.94  Minor paraphrase; same meaning with trivially different wording.
  0.60 – 0.79  Some interpretation required; meaning is preserved but phrasing diverges.
  0.40 – 0.59  Ambiguous; the transcript could support this reading but is not clear.
  0.20 – 0.39  Weak connection; only tangentially related material in transcript.
  0.00 – 0.19  No meaningful connection to anything in the transcript.

For GROUNDED claims, confidence should typically be 0.80–1.00.
For UNGROUNDED claims, confidence should reflect how certain you are that the claim is fabricated (high confidence = definitely not in transcript).
For PARTIAL claims, confidence reflects how much of the claim is supported.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVIDENCE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each claim you MUST provide:

1. TRANSCRIPT QUOTES: Copy the exact, verbatim text from the transcript that supports or refutes the claim. Include enough context for the quote to be meaningful. If no relevant text exists, provide an empty array and explain in reasoning.

2. LINE NUMBER RANGES: For each quote, provide the [start_line, end_line] pair indicating where in the numbered transcript the quote appears. These must be accurate — they will be used to highlight the transcript in the UI.

3. REASONING: Explain step-by-step why you reached your verdict. Reference the specific edge-case rule(s) that apply. Be explicit about what matches and what does not.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return your response as a JSON object matching the required schema. Do not include any text outside the JSON. Verify every single claim — do not skip any.`;

/**
 * buildVerificationUserPrompt
 *
 * Builds the user-message content for the claim-verification call. It
 * serialises the claims as a numbered JSON list and prepends line numbers to
 * every line of the transcript so the model can cite exact locations.
 *
 * @param claims     — array of Claim objects to verify
 * @param transcript — the raw conversation transcript text (newline-delimited)
 * @returns          — the formatted user prompt string containing both the
 *                     claims JSON and the line-numbered transcript
 */
export function buildVerificationUserPrompt(
  claims: Claim[],
  transcript: string
): string {
  const numberedTranscript = transcript
    .split("\n")
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");

  const claimsJson = JSON.stringify(claims, null, 2);

  return `Verify each of the following claims against the conversation transcript below. For every claim, determine a verdict (grounded, ungrounded, or partial), assign a confidence score, cite exact transcript quotes with line numbers, and provide reasoning.

<claims>
${claimsJson}
</claims>

<transcript>
${numberedTranscript}
</transcript>

Verify every claim now. Apply the edge-case rules strictly. Be aggressive about marking claims as UNGROUNDED when they lack clear transcript support. Remember: a missed hallucination is worse than a false alarm.`;
}

// ---------------------------------------------------------------------------
// OpenAI structured-output JSON schemas
// ---------------------------------------------------------------------------

/**
 * EXTRACT_CLAIMS_SCHEMA
 *
 * JSON Schema passed to the OpenAI API's "response_format" parameter when
 * calling the claim-extraction endpoint. It enforces that the model returns
 * a well-typed array of Claim objects inside a wrapper object.
 *
 * Structure:
 *   { claims: Claim[] }
 *
 * Each Claim has:
 *   - id       (string)  — unique claim identifier, e.g. "claim_1"
 *   - text     (string)  — the atomic assertion text
 *   - section  (enum)    — one of the four SOAP sections
 *   - category (enum)    — one of the eleven clinical claim categories
 *
 * The schema uses "strict: true" so OpenAI guarantees the output conforms
 * exactly, with no additional properties.
 */
export const EXTRACT_CLAIMS_SCHEMA = {
  name: "extract_claims",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      claims: {
        type: "array" as const,
        description:
          "Array of atomic, verifiable claims extracted from the clinical note.",
        items: {
          type: "object" as const,
          properties: {
            id: {
              type: "string" as const,
              description:
                'Unique sequential identifier for the claim, e.g. "claim_1", "claim_2".',
            },
            text: {
              type: "string" as const,
              description:
                "The atomic assertion text — a single verifiable fact from the note.",
            },
            section: {
              type: "string" as const,
              enum: ["subjective", "objective", "assessment", "plan"],
              description:
                "The SOAP section of the clinical note this claim originates from.",
            },
            category: {
              type: "string" as const,
              enum: [
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
              ],
              description:
                "The clinical category that best describes this claim.",
            },
          },
          required: ["id", "text", "section", "category"],
          additionalProperties: false,
        },
      },
    },
    required: ["claims"],
    additionalProperties: false,
  },
} as const;

/**
 * VERIFY_CLAIMS_SCHEMA
 *
 * JSON Schema passed to the OpenAI API's "response_format" parameter when
 * calling the claim-verification endpoint. It enforces that the model returns
 * a well-typed array of VerifiedClaim objects inside a wrapper object.
 *
 * Structure:
 *   { verified_claims: VerifiedClaim[] }
 *
 * Each VerifiedClaim has:
 *   - id                     (string) — must match the original claim ID
 *   - text                   (string) — the original claim text
 *   - section                (enum)   — SOAP section
 *   - category               (enum)   — clinical category
 *   - verdict                (enum)   — "grounded" | "ungrounded" | "partial"
 *   - confidence             (number) — 0.0 to 1.0
 *   - evidence.transcript_quotes      (string[])       — exact quotes
 *   - evidence.transcript_line_ranges ([number,number][]) — line ranges
 *   - evidence.reasoning              (string)         — step-by-step reasoning
 *   - explanation            (string) — concise human-readable explanation
 *
 * The schema uses "strict: true" so OpenAI guarantees the output conforms
 * exactly, with no additional properties.
 */
export const VERIFY_CLAIMS_SCHEMA = {
  name: "verify_claims",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      verified_claims: {
        type: "array" as const,
        description:
          "Array of claims with verification verdicts, confidence scores, and evidence.",
        items: {
          type: "object" as const,
          properties: {
            id: {
              type: "string" as const,
              description:
                "The original claim ID, matching the input claim exactly.",
            },
            text: {
              type: "string" as const,
              description: "The original claim text, copied verbatim.",
            },
            section: {
              type: "string" as const,
              enum: ["subjective", "objective", "assessment", "plan"],
              description: "The SOAP section of the original claim.",
            },
            category: {
              type: "string" as const,
              enum: [
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
              ],
              description: "The clinical category of the original claim.",
            },
            verdict: {
              type: "string" as const,
              enum: ["grounded", "ungrounded", "partial"],
              description:
                "The verification verdict: grounded, ungrounded, or partial.",
            },
            confidence: {
              type: "number" as const,
              description:
                "Confidence score between 0.0 and 1.0 reflecting certainty in the verdict.",
            },
            evidence: {
              type: "object" as const,
              description:
                "Supporting evidence from the transcript for this verdict.",
              properties: {
                transcript_quotes: {
                  type: "array" as const,
                  description:
                    "Exact verbatim quotes from the transcript that support or refute the claim.",
                  items: {
                    type: "string" as const,
                  },
                },
                transcript_line_ranges: {
                  type: "array" as const,
                  description:
                    "Array of [start_line, end_line] pairs indicating where each quote appears.",
                  items: {
                    type: "array" as const,
                    items: {
                      type: "number" as const,
                    },
                  },
                },
                reasoning: {
                  type: "string" as const,
                  description:
                    "Step-by-step explanation of how the evidence relates to the claim and why this verdict was reached. Reference applicable edge-case rules.",
                },
              },
              required: [
                "transcript_quotes",
                "transcript_line_ranges",
                "reasoning",
              ],
              additionalProperties: false,
            },
            explanation: {
              type: "string" as const,
              description:
                "A concise, plain-language explanation of the verdict suitable for display to a clinician reviewer.",
            },
          },
          required: [
            "id",
            "text",
            "section",
            "category",
            "verdict",
            "confidence",
            "evidence",
            "explanation",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["verified_claims"],
    additionalProperties: false,
  },
} as const;
