"use client";

/**
 * AnalysisControls -- A row of action buttons that drive the hallucination
 * detection workflow: triggering analysis, loading demo data, and resetting
 * the form.
 *
 * The component adapts its button states and labels to the current analysis
 * status so the user always sees contextually appropriate affordances.
 *
 * Props:
 *   onAnalyze  -- Callback fired when the user clicks the primary "Analyze
 *                 Note" button.
 *   onLoadDemo -- Callback fired when the user clicks "Try Demo" to populate
 *                 the transcript and note fields with sample data.
 *   onReset    -- Callback fired when the user clicks "Clear" to reset all
 *                 inputs and results.
 *   status     -- Current pipeline status. One of:
 *                   "idle"       -- no analysis running
 *                   "extracting" -- claims are being extracted from the note
 *                   "verifying"  -- extracted claims are being verified
 *                   "complete"   -- analysis finished successfully
 *                   "error"      -- analysis encountered an error
 *   hasInputs  -- Whether the transcript and note textareas both have content.
 *                 When false, the Analyze button is disabled.
 *
 * Renders:
 *   A horizontal flex row containing up to three <Button> components:
 *     1. "Analyze Note" (primary) -- disabled when inputs are missing or an
 *        analysis is running. Shows a spinner and contextual label during
 *        extraction/verification.
 *     2. "Try Demo" (secondary) -- disabled while analysis is running.
 *     3. "Clear" (ghost) -- only rendered when the form is dirty (hasInputs)
 *        or when the status is no longer "idle".
 */

import React from "react";
import Button from "@/components/ui/Button";

interface AnalysisControlsProps {
  onAnalyze: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  status: "idle" | "extracting" | "verifying" | "complete" | "error";
  hasInputs: boolean;
}

/**
 * getAnalyzeLabel -- Returns the appropriate label text for the primary
 * Analyze button based on the current pipeline status.
 *
 * Inputs:
 *   status -- The current analysis pipeline status string.
 *
 * Outputs:
 *   A human-readable button label string. During active analysis the label
 *   indicates which phase is in progress; otherwise it reads "Analyze Note".
 */
function getAnalyzeLabel(
  status: AnalysisControlsProps["status"]
): string {
  switch (status) {
    case "extracting":
      return "Extracting claims...";
    case "verifying":
      return "Verifying claims...";
    default:
      return "Analyze Note";
  }
}

export default function AnalysisControls({
  onAnalyze,
  onLoadDemo,
  onReset,
  status,
  hasInputs,
}: AnalysisControlsProps) {
  const isAnalyzing = status === "extracting" || status === "verifying";
  const showClear = status !== "idle" || hasInputs;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        variant="primary"
        disabled={!hasInputs || isAnalyzing}
        loading={isAnalyzing}
        onClick={onAnalyze}
      >
        {getAnalyzeLabel(status)}
      </Button>

      <Button
        variant="secondary"
        disabled={isAnalyzing}
        onClick={onLoadDemo}
      >
        Try Demo
      </Button>

      {showClear && (
        <Button variant="ghost" onClick={onReset}>
          Clear
        </Button>
      )}
    </div>
  );
}
