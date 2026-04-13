"use client";

/**
 * AnalyzePage — Main analysis workspace where users paste a transcript and
 * clinical note, then run hallucination detection.
 *
 * Layout:
 *   - Two-column grid on desktop (lg+), stacked on mobile
 *   - Left: transcript input, note input, analysis controls
 *   - Right: summary stats, results dashboard, transcript highlight
 *   - Reads ?demo=true query param to auto-load demo data on mount
 *
 * Props: none (Next.js page component)
 * Renders: fully wired analysis workspace with all child components
 */

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAnalysis } from "@/hooks/useAnalysis";
import TranscriptInput from "@/components/analyze/TranscriptInput";
import NoteInput from "@/components/analyze/NoteInput";
import AnalysisControls from "@/components/analyze/AnalysisControls";
import SummaryStats from "@/components/analyze/SummaryStats";
import ResultsDashboard from "@/components/analyze/ResultsDashboard";
import TranscriptHighlight from "@/components/analyze/TranscriptHighlight";
import ExportButton from "@/components/analyze/ExportButton";

/**
 * AnalyzePageContent — Inner component that uses useSearchParams (requires
 * Suspense boundary). Handles the demo query param and renders the workspace.
 */
function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const analysis = useAnalysis();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  /* Auto-load demo data if ?demo=true */
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      analysis.loadDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Derive highlight state from selected claim */
  const selectedClaim = analysis.result?.claims.find(
    (c) => c.id === selectedClaimId
  );
  const highlightRanges = selectedClaim?.evidence.transcript_line_ranges ?? [];
  const highlightColor: "green" | "red" | "amber" =
    selectedClaim?.verdict === "grounded"
      ? "green"
      : selectedClaim?.verdict === "ungrounded"
        ? "red"
        : "amber";

  const isAnalyzing =
    analysis.status === "extracting" || analysis.status === "verifying";
  const hasInputs =
    analysis.transcript.trim() !== "" && analysis.note.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Analyze Clinical Note
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste a transcript and clinical note to detect unsupported claims.
        </p>
      </div>

      {/* Two-column workspace */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left column: Inputs */}
          <div className="space-y-6">
            <TranscriptInput
              value={analysis.transcript}
              onChange={analysis.setTranscript}
              disabled={isAnalyzing}
            />
            <NoteInput
              value={analysis.note}
              onChange={analysis.setNote}
              disabled={isAnalyzing}
            />
            <AnalysisControls
              onAnalyze={analysis.analyze}
              onLoadDemo={analysis.loadDemo}
              onReset={analysis.reset}
              status={analysis.status}
              hasInputs={hasInputs}
            />
            {analysis.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {analysis.error}
              </div>
            )}
          </div>

          {/* Right column: Results */}
          <div className="space-y-6">
            {analysis.result ? (
              <>
                <SummaryStats summary={analysis.result.summary} />
                <ExportButton result={analysis.result} />
                <ResultsDashboard
                  claims={analysis.result.claims}
                  selectedClaimId={selectedClaimId}
                  onSelectClaim={setSelectedClaimId}
                />
                {selectedClaim && (
                  <TranscriptHighlight
                    transcriptLines={analysis.result.transcript_lines}
                    highlightRanges={highlightRanges}
                    highlightColor={highlightColor}
                  />
                )}
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                <p className="text-sm text-slate-400">
                  {isAnalyzing
                    ? analysis.status === "extracting"
                      ? "Extracting claims from note..."
                      : "Verifying claims against transcript..."
                    : "Results will appear here after analysis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AnalyzePage — Wraps content in Suspense boundary required by useSearchParams.
 */
export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-400">Loading...</p>
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
