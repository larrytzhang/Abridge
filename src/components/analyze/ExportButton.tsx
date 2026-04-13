"use client";

/**
 * ExportButton -- Generates and downloads a Markdown report summarising the
 * hallucination analysis results.
 *
 * When the user clicks this button the component:
 *   1. Builds a Markdown string inline containing:
 *      - A top-level title ("# Clinical Note Hallucination Report")
 *      - The date and time the report was generated
 *      - A summary section with total claim counts, per-verdict counts, and
 *        percentages, plus the overall accuracy score
 *      - A "## Hallucinated Claims" section listing every ungrounded claim
 *        with its explanation and supporting/refuting transcript quotes
 *      - A "## Partially Supported Claims" section listing every partial claim
 *      - A "## Grounded Claims" section listing every grounded claim
 *   2. Wraps the Markdown in a Blob, creates an object URL, and triggers a
 *      browser download of "hallucination-report.md".
 *
 * Props:
 *   result -- The full AnalysisResult object (imported from "@/lib") containing
 *             verified claims, summary statistics, and transcript lines.
 *
 * Renders:
 *   A single <Button> (secondary variant) labelled "Export Report".
 */

import React from "react";
import Button from "@/components/ui/Button";
import type { AnalysisResult, VerifiedClaim } from "@/lib";

interface ExportButtonProps {
  result: AnalysisResult;
}

/**
 * formatClaimEntry -- Formats a single VerifiedClaim into a Markdown list item
 * with its explanation and evidence quotes.
 *
 * Inputs:
 *   claim -- A VerifiedClaim object containing the claim text, explanation,
 *            verdict confidence, and evidence with transcript quotes.
 *   index -- The 1-based display index for the claim in its section list.
 *
 * Outputs:
 *   A multi-line Markdown string representing the claim as a numbered entry
 *   with nested explanation and quoted evidence lines.
 */
function formatClaimEntry(claim: VerifiedClaim, index: number): string {
  const lines: string[] = [];
  lines.push(`${index}. **${claim.text}**`);
  lines.push(`   - **Section:** ${claim.section}`);
  lines.push(`   - **Category:** ${claim.category}`);
  lines.push(`   - **Confidence:** ${(claim.confidence * 100).toFixed(0)}%`);
  lines.push(`   - **Explanation:** ${claim.explanation}`);

  if (claim.evidence.transcript_quotes.length > 0) {
    lines.push(`   - **Evidence quotes:**`);
    for (const quote of claim.evidence.transcript_quotes) {
      lines.push(`     > ${quote}`);
    }
  }

  return lines.join("\n");
}

/**
 * generateReport -- Builds the full Markdown report string from an
 * AnalysisResult.
 *
 * Inputs:
 *   result -- The complete AnalysisResult with claims, summary, and transcript
 *             lines.
 *
 * Outputs:
 *   A Markdown-formatted string ready to be saved as a .md file.
 */
function generateReport(result: AnalysisResult): string {
  const { claims, summary } = result;
  const now = new Date();
  const generatedDate = now.toLocaleString();

  const pctGrounded =
    summary.total_claims > 0
      ? ((summary.grounded / summary.total_claims) * 100).toFixed(1)
      : "0.0";
  const pctUngrounded =
    summary.total_claims > 0
      ? ((summary.ungrounded / summary.total_claims) * 100).toFixed(1)
      : "0.0";
  const pctPartial =
    summary.total_claims > 0
      ? ((summary.partial / summary.total_claims) * 100).toFixed(1)
      : "0.0";

  const ungrounded = claims.filter((c) => c.verdict === "ungrounded");
  const partial = claims.filter((c) => c.verdict === "partial");
  const grounded = claims.filter((c) => c.verdict === "grounded");

  const sections: string[] = [];

  // Title
  sections.push("# Clinical Note Hallucination Report");
  sections.push("");
  sections.push(`**Generated:** ${generatedDate}`);
  sections.push("");

  // Summary
  sections.push("## Summary");
  sections.push("");
  sections.push(`| Metric | Value |`);
  sections.push(`| --- | --- |`);
  sections.push(`| Total Claims | ${summary.total_claims} |`);
  sections.push(
    `| Grounded | ${summary.grounded} (${pctGrounded}%) |`
  );
  sections.push(
    `| Ungrounded (Hallucinated) | ${summary.ungrounded} (${pctUngrounded}%) |`
  );
  sections.push(
    `| Partially Supported | ${summary.partial} (${pctPartial}%) |`
  );
  sections.push(`| Overall Accuracy Score | ${summary.overall_score}/100 |`);
  sections.push("");

  // Hallucinated Claims
  sections.push("## Hallucinated Claims");
  sections.push("");
  if (ungrounded.length === 0) {
    sections.push("No hallucinated claims detected.");
  } else {
    for (let i = 0; i < ungrounded.length; i++) {
      sections.push(formatClaimEntry(ungrounded[i], i + 1));
      sections.push("");
    }
  }
  sections.push("");

  // Partially Supported Claims
  sections.push("## Partially Supported Claims");
  sections.push("");
  if (partial.length === 0) {
    sections.push("No partially supported claims detected.");
  } else {
    for (let i = 0; i < partial.length; i++) {
      sections.push(formatClaimEntry(partial[i], i + 1));
      sections.push("");
    }
  }
  sections.push("");

  // Grounded Claims
  sections.push("## Grounded Claims");
  sections.push("");
  if (grounded.length === 0) {
    sections.push("No grounded claims detected.");
  } else {
    for (let i = 0; i < grounded.length; i++) {
      sections.push(formatClaimEntry(grounded[i], i + 1));
      sections.push("");
    }
  }

  return sections.join("\n");
}

/**
 * triggerDownload -- Creates a temporary object URL from a Blob and triggers
 * the browser file-download mechanism by clicking a programmatically created
 * anchor element.
 *
 * Inputs:
 *   content  -- The string content to download.
 *   filename -- The suggested filename for the downloaded file.
 *
 * Outputs:
 *   None. Side-effect: initiates a browser download of the given content as
 *   a file with the specified name.
 */
function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function ExportButton({ result }: ExportButtonProps) {
  /**
   * handleExport -- Click handler that generates the Markdown report from the
   * analysis result and triggers a browser download.
   *
   * Inputs: None (reads `result` from component props via closure).
   * Outputs: None. Side-effect: downloads "hallucination-report.md".
   */
  function handleExport(): void {
    const markdown = generateReport(result);
    triggerDownload(markdown, "hallucination-report.md");
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      Export Report
    </Button>
  );
}
