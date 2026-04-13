"use client";

/**
 * useAnalysis — Custom React hook that manages the full analysis state machine
 * for the Clinical Note Hallucination Detector.
 *
 * This hook orchestrates the two-phase analysis pipeline:
 *   Phase 1 ("extracting"): Sends the clinical note to the /api/extract-claims
 *     endpoint to decompose it into atomic, verifiable claims.
 *   Phase 2 ("verifying"): Sends the extracted claims plus the source transcript
 *     to /api/verify-claims to check each claim against the transcript.
 *
 * State machine statuses:
 *   "idle"       — initial state, no analysis in progress
 *   "extracting" — phase 1 in progress (extracting claims from the note)
 *   "verifying"  — phase 2 in progress (verifying claims against transcript)
 *   "complete"   — analysis finished, results available
 *   "error"      — an error occurred during analysis
 *
 * Inputs: None (all state is managed internally).
 *
 * Returns an object with:
 *   - status        (AnalysisStatus)    — current state machine status
 *   - transcript    (string)            — the source transcript text
 *   - note          (string)            — the clinical note text
 *   - claims        (Claim[])           — extracted claims (populated after phase 1)
 *   - result        (AnalysisResult | null) — full analysis result (populated after phase 2)
 *   - error         (string | null)     — error message if status is "error"
 *   - setTranscript (setter)            — update the transcript text
 *   - setNote       (setter)            — update the note text
 *   - analyze       () => Promise<void> — kick off the two-phase analysis pipeline
 *   - loadDemo      () => void          — populate transcript and note with demo data
 *   - reset         () => void          — reset all state back to initial values
 */

import { useState, useCallback } from "react";
import type {
  Claim,
  AnalysisResult,
  AnalysisSummary,
  VerifiedClaim,
  ExtractClaimsResponse,
  VerifyClaimsResponse,
} from "@/lib";

type AnalysisStatus = "idle" | "extracting" | "verifying" | "complete" | "error";

/**
 * computeSummary — Computes aggregate statistics from an array of verified claims.
 *
 * Counts the number of grounded, ungrounded, and partial verdicts, then
 * calculates an overall accuracy score using the formula:
 *   overall_score = Math.round((grounded + partial * 0.5) / total * 100)
 *
 * Inputs:
 *   - claims (VerifiedClaim[]): Array of verified claims with verdict fields.
 *
 * Returns:
 *   - AnalysisSummary: Object containing total_claims, grounded, ungrounded,
 *     partial counts and the overall_score (0-100 integer).
 */
function computeSummary(claims: VerifiedClaim[]): AnalysisSummary {
  const total_claims = claims.length;
  const grounded = claims.filter((c) => c.verdict === "grounded").length;
  const ungrounded = claims.filter((c) => c.verdict === "ungrounded").length;
  const partial = claims.filter((c) => c.verdict === "partial").length;
  const overall_score =
    total_claims > 0
      ? Math.round(((grounded + partial * 0.5) / total_claims) * 100)
      : 0;

  return { total_claims, grounded, ungrounded, partial, overall_score };
}

export function useAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * analyze — Executes the full two-phase analysis pipeline.
   *
   * Phase 1: POSTs the clinical note to /api/extract-claims and stores the
   *   returned Claim[] array.
   * Phase 2: POSTs the claims and transcript to /api/verify-claims, computes
   *   the summary statistics, and builds the final AnalysisResult.
   *
   * On success, sets status to "complete" and populates the result.
   * On failure at any phase, sets status to "error" and stores the error message.
   *
   * Inputs: None (reads transcript and note from hook state).
   * Outputs: None (updates hook state: status, claims, result, error).
   */
  const analyze = useCallback(async () => {
    try {
      // Phase 1: Extract claims
      setStatus("extracting");
      setError(null);
      setResult(null);
      setClaims([]);

      /**
       * Phase 1 fetch — Sends the clinical note to /api/extract-claims with a
       * 30-second timeout via AbortController. On failure, extracts a
       * user-friendly error message from the JSON response body. On success,
       * validates that the response contains a claims array before proceeding.
       */
      const extractController = new AbortController();
      const extractTimeout = setTimeout(() => extractController.abort(), 30_000);
      let extractRes: Response;
      try {
        extractRes = await fetch("/api/extract-claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
          signal: extractController.signal,
        });
      } finally {
        clearTimeout(extractTimeout);
      }

      if (!extractRes.ok) {
        const errData = await extractRes.json().catch(() => null);
        throw new Error(errData?.error ?? "Claim extraction failed. Please try again.");
      }

      const extractData: ExtractClaimsResponse = await extractRes.json();

      /**
       * Runtime validation — Ensures the extract response contains a valid
       * claims array before storing it in state. Guards against malformed
       * or unexpected server responses.
       */
      if (!extractData.claims || !Array.isArray(extractData.claims)) {
        throw new Error("Invalid response from server. Please try again.");
      }

      setClaims(extractData.claims);

      // Phase 2: Verify claims against transcript
      setStatus("verifying");

      /**
       * Phase 2 fetch — Sends the extracted claims and transcript to
       * /api/verify-claims with a 30-second timeout via AbortController.
       * On failure, extracts a user-friendly error from the JSON response.
       * On success, validates the response shape before computing summary.
       */
      const verifyController = new AbortController();
      const verifyTimeout = setTimeout(() => verifyController.abort(), 30_000);
      let verifyRes: Response;
      try {
        verifyRes = await fetch("/api/verify-claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claims: extractData.claims, transcript }),
          signal: verifyController.signal,
        });
      } finally {
        clearTimeout(verifyTimeout);
      }

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => null);
        throw new Error(errData?.error ?? "Claim verification failed. Please try again.");
      }

      const verifyData: VerifyClaimsResponse = await verifyRes.json();

      /**
       * Runtime validation — Ensures the verify response contains a valid
       * verified_claims array before computing summary statistics. Guards
       * against malformed or unexpected server responses.
       */
      if (!verifyData.verified_claims || !Array.isArray(verifyData.verified_claims)) {
        throw new Error("Invalid response from server. Please try again.");
      }

      // Compute summary and build final result
      const summary = computeSummary(verifyData.verified_claims);
      const transcript_lines = transcript.split("\n");

      const analysisResult: AnalysisResult = {
        claims: verifyData.verified_claims,
        summary,
        transcript_lines,
      };

      setResult(analysisResult);
      setStatus("complete");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }, [note, transcript]);

  /**
   * loadDemo — Dynamically imports the demo data module and populates the
   * transcript and note fields with sample data for demonstration purposes.
   *
   * Inputs: None.
   * Outputs: None (updates transcript and note state with demo values).
   */
  const loadDemo = useCallback(async () => {
    const { DEMO_TRANSCRIPT, DEMO_NOTE } = await import("@/data/demo");
    setTranscript(DEMO_TRANSCRIPT);
    setNote(DEMO_NOTE);
  }, []);

  /**
   * reset — Resets all hook state back to initial values, clearing any
   * analysis results, claims, errors, and input text.
   *
   * Inputs: None.
   * Outputs: None (resets all state to defaults).
   */
  const reset = useCallback(() => {
    setStatus("idle");
    setTranscript("");
    setNote("");
    setClaims([]);
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    transcript,
    note,
    claims,
    result,
    error,
    setTranscript,
    setNote,
    analyze,
    loadDemo,
    reset,
  };
}
