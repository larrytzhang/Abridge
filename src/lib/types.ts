/**
 * types.ts
 *
 * Central type definitions for the Clinical Note Hallucination Detector.
 * All domain types, API request/response shapes, and shared enumerations
 * live here so that every module in the application imports from a single
 * source of truth.
 */

// ---------------------------------------------------------------------------
// Enumerations (union types)
// ---------------------------------------------------------------------------

/**
 * Verdict indicates whether a claim extracted from a clinical note is
 * supported by the conversation transcript.
 *
 * - "grounded"   — the claim is directly stated or clearly supported by the transcript.
 * - "ungrounded" — the claim is not found in the transcript, contradicts it, or fabricates details.
 * - "partial"    — the claim has some basis in the transcript but adds, changes, or infers details.
 */
export type Verdict = "grounded" | "ungrounded" | "partial";

/**
 * ClaimCategory classifies the clinical nature of an extracted claim so that
 * downstream verification can apply category-specific rules (e.g., exact-match
 * requirements for vital signs vs. acceptable paraphrase for patient statements).
 *
 * Categories:
 * - "patient_statement" — something the patient said or reported
 * - "physical_finding"  — an observation from a physical examination
 * - "vital_sign"        — a measured vital sign (BP, HR, temp, SpO2, etc.)
 * - "symptom"           — a symptom described or attributed to the patient
 * - "diagnosis"         — a diagnostic conclusion or differential
 * - "medication"        — a medication name, dose, route, or frequency
 * - "plan_action"       — a planned action, order, referral, or follow-up
 * - "history"           — past medical, surgical, social, or family history
 * - "temporal"          — a time-related claim (onset, duration, frequency)
 * - "negation"          — a denial or absence of a finding/symptom
 * - "inference"         — a clinical inference or reasoning step
 */
export type ClaimCategory =
  | "patient_statement"
  | "physical_finding"
  | "vital_sign"
  | "symptom"
  | "diagnosis"
  | "medication"
  | "plan_action"
  | "history"
  | "temporal"
  | "negation"
  | "inference";

/**
 * SOAPSection identifies which section of a SOAP-formatted clinical note a
 * claim belongs to.
 *
 * - "subjective"  — patient-reported information (history, symptoms, complaints)
 * - "objective"   — clinician-observed or measured data (exam, vitals, labs)
 * - "assessment"  — clinical interpretation, diagnoses, differentials
 * - "plan"        — treatment plan, orders, follow-up actions
 */
export type SOAPSection = "subjective" | "objective" | "assessment" | "plan";

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

/**
 * Claim represents a single atomic, verifiable assertion extracted from a
 * clinical note. Each claim is independently checkable against the
 * conversation transcript.
 *
 * Fields:
 * - id       — unique identifier for referencing this claim (e.g., "claim_1")
 * - text     — the verbatim or lightly paraphrased assertion text
 * - section  — the SOAP section of the note where this claim originated
 * - category — the clinical category that best describes this claim
 */
export interface Claim {
  id: string;
  text: string;
  section: SOAPSection;
  category: ClaimCategory;
}

/**
 * Evidence contains the supporting (or refuting) material from the
 * conversation transcript that was used to judge a claim.
 *
 * Fields:
 * - transcript_quotes      — exact verbatim quotes from the transcript that
 *                            relate to the claim (supporting or contradicting)
 * - transcript_line_ranges — array of [start, end] line-number pairs indicating
 *                            where each quote appears in the numbered transcript
 * - reasoning              — free-text explanation of how the evidence relates
 *                            to the claim and why the verdict was reached
 */
export interface Evidence {
  transcript_quotes: string[];
  transcript_line_ranges: [number, number][];
  reasoning: string;
}

/**
 * VerifiedClaim extends a Claim with the results of verification against the
 * conversation transcript. It carries the verdict, confidence score,
 * supporting evidence, and a human-readable explanation.
 *
 * Fields (in addition to Claim fields):
 * - verdict     — "grounded", "ungrounded", or "partial"
 * - confidence  — numeric score between 0 and 1 indicating confidence in the
 *                 verdict (1 = certain, 0 = no basis)
 * - evidence    — the Evidence object with quotes, line ranges, and reasoning
 * - explanation — a concise, plain-language explanation of the verdict suitable
 *                 for display to a clinician reviewer
 */
export interface VerifiedClaim extends Claim {
  verdict: Verdict;
  confidence: number;
  evidence: Evidence;
  explanation: string;
}

/**
 * AnalysisSummary provides aggregate statistics for a full note analysis,
 * giving a quick overview of documentation accuracy.
 *
 * Fields:
 * - total_claims  — total number of claims extracted from the note
 * - grounded      — count of claims verified as grounded
 * - ungrounded    — count of claims verified as ungrounded
 * - partial       — count of claims verified as partial
 * - overall_score — a 0–100 integer score summarising overall note accuracy
 *                   (100 = all claims grounded, 0 = all claims ungrounded)
 */
export interface AnalysisSummary {
  total_claims: number;
  grounded: number;
  ungrounded: number;
  partial: number;
  overall_score: number;
}

/**
 * AnalysisResult is the top-level output of a complete hallucination-detection
 * run. It bundles every verified claim, the summary statistics, and the
 * original transcript lines for cross-reference in the UI.
 *
 * Fields:
 * - claims           — array of VerifiedClaim objects, one per extracted claim
 * - summary          — aggregate accuracy statistics
 * - transcript_lines — the conversation transcript split into numbered lines
 *                      (the same numbering used in evidence line ranges)
 */
export interface AnalysisResult {
  claims: VerifiedClaim[];
  summary: AnalysisSummary;
  transcript_lines: string[];
}

// ---------------------------------------------------------------------------
// API request / response types
// ---------------------------------------------------------------------------

/**
 * ExtractClaimsRequest is the request body sent to the claim-extraction API
 * endpoint. It contains the raw clinical note text to be decomposed.
 *
 * Fields:
 * - note — the full text of the AI-generated clinical note
 */
export interface ExtractClaimsRequest {
  note: string;
}

/**
 * ExtractClaimsResponse is the response body returned from the
 * claim-extraction API endpoint. It contains the array of atomic claims
 * extracted from the note.
 *
 * Fields:
 * - claims — array of Claim objects extracted from the note
 */
export interface ExtractClaimsResponse {
  claims: Claim[];
}

/**
 * VerifyClaimsRequest is the request body sent to the claim-verification API
 * endpoint. It contains the claims to verify and the transcript to verify
 * them against.
 *
 * Fields:
 * - claims     — array of Claim objects to be verified
 * - transcript — the full conversation transcript text (will be line-numbered
 *                server-side before being sent to the LLM)
 */
export interface VerifyClaimsRequest {
  claims: Claim[];
  transcript: string;
}

/**
 * VerifyClaimsResponse is the response body returned from the
 * claim-verification API endpoint. It contains the verified claims with
 * verdicts, confidence scores, and evidence.
 *
 * Fields:
 * - verified_claims — array of VerifiedClaim objects with verification results
 */
export interface VerifyClaimsResponse {
  verified_claims: VerifiedClaim[];
}
