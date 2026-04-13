"use client";

/**
 * ClaimCard — Renders a single verified claim as an interactive card with
 * verdict badge, confidence bar, evidence details, and selection state.
 *
 * Visual structure (top to bottom):
 *   1. Header row: verdict Badge, SOAP section label (small gray text),
 *      and claim category label.
 *   2. Confidence bar: a horizontal bar whose width equals confidence * 100%,
 *      colored by verdict (green for grounded, red for ungrounded, amber for partial).
 *   3. Claim text: the assertion extracted from the clinical note.
 *   4. Explanation: plain-language explanation of the verdict.
 *   5. Collapsible "Show evidence" section containing:
 *      - Transcript quotes rendered as blockquotes.
 *      - Line ranges displayed as comma-separated pairs.
 *      - Reasoning text explaining the evidence evaluation.
 *
 * Selection behavior:
 *   - Clicking the card calls onSelect(claim.id).
 *   - When isSelected is true, the card receives a blue-600 left border
 *     and a blue-50 background to visually indicate selection.
 *
 * Props:
 *   - claim      (VerifiedClaim): The verified claim object with verdict,
 *                 confidence, evidence, explanation, section, and category.
 *   - isSelected (boolean): Whether this card is currently selected.
 *   - onSelect   ((id: string) => void): Callback invoked with the claim's id
 *                 when the card is clicked.
 *
 * Outputs:
 *   - Renders a styled, clickable card element with all claim details.
 */

import React, { useState } from "react";
import type { VerifiedClaim } from "@/lib";
import Badge from "@/components/ui/Badge";

interface ClaimCardProps {
  claim: VerifiedClaim;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * getConfidenceBarColor — Returns the appropriate Tailwind background color
 * class for the confidence bar based on the claim's verdict.
 *
 * Inputs:
 *   - verdict ("grounded" | "ungrounded" | "partial"): The claim verdict.
 *
 * Returns:
 *   - string: Tailwind bg class — "bg-green-500" for grounded,
 *     "bg-red-500" for ungrounded, "bg-amber-500" for partial.
 */
function getConfidenceBarColor(verdict: string): string {
  switch (verdict) {
    case "grounded":
      return "bg-green-500";
    case "ungrounded":
      return "bg-red-500";
    case "partial":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
}

/**
 * formatSoapSection — Capitalizes the first letter of a SOAP section name
 * for display purposes.
 *
 * Inputs:
 *   - section (string): A lowercase SOAP section name (e.g., "subjective").
 *
 * Returns:
 *   - string: The section name with the first letter capitalized (e.g., "Subjective").
 */
function formatSoapSection(section: string): string {
  return section.charAt(0).toUpperCase() + section.slice(1);
}

/**
 * formatCategory — Converts a snake_case claim category to a human-readable
 * title-case string.
 *
 * Inputs:
 *   - category (string): A snake_case category (e.g., "patient_statement").
 *
 * Returns:
 *   - string: A title-case string with spaces (e.g., "Patient Statement").
 */
function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ClaimCard({ claim, isSelected, onSelect }: ClaimCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const selectedStyles = isSelected
    ? "border-l-4 border-l-blue-600 bg-blue-50"
    : "border border-gray-200 bg-white";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(claim.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(claim.id);
        }
      }}
      className={`cursor-pointer rounded-lg p-4 shadow-sm transition-colors hover:shadow-md ${selectedStyles}`}
    >
      {/* Header row: Badge, SOAP section, category */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={claim.verdict}>
          {claim.verdict.charAt(0).toUpperCase() + claim.verdict.slice(1)}
        </Badge>
        <span className="text-xs text-gray-400">
          {formatSoapSection(claim.section)}
        </span>
        <span className="text-xs font-medium text-gray-500">
          {formatCategory(claim.category)}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Confidence</span>
          <span>{Math.round(claim.confidence * 100)}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${getConfidenceBarColor(claim.verdict)}`}
            style={{ width: `${claim.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Claim text */}
      <p className="mt-3 text-sm text-gray-800">{claim.text}</p>

      {/* Explanation */}
      <p className="mt-2 text-xs italic text-gray-500">{claim.explanation}</p>

      {/* Collapsible evidence section */}
      <div className="mt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEvidence((prev) => !prev);
          }}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {showEvidence ? "Hide evidence" : "Show evidence"}
        </button>

        {showEvidence && (
          <div className="mt-2 space-y-3 rounded-md bg-gray-50 p-3">
            {/* Transcript quotes */}
            {claim.evidence.transcript_quotes.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-600">
                  Transcript Quotes
                </p>
                {claim.evidence.transcript_quotes.map((quote, idx) => (
                  <blockquote
                    key={idx}
                    className="mb-1 border-l-2 border-gray-300 pl-2 text-xs text-gray-600"
                  >
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                ))}
              </div>
            )}

            {/* Line ranges */}
            {claim.evidence.transcript_line_ranges.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-600">
                  Line Ranges
                </p>
                <p className="text-xs text-gray-500">
                  {claim.evidence.transcript_line_ranges
                    .map(([start, end]) => `${start}-${end}`)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Reasoning */}
            {claim.evidence.reasoning && (
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-600">
                  Reasoning
                </p>
                <p className="text-xs text-gray-600">
                  {claim.evidence.reasoning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
