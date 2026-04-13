"use client";

/**
 * ResultsDashboard — A filterable, scrollable dashboard that displays all
 * verified claims organized by verdict type.
 *
 * Features:
 *   - Filter tabs at the top: "All", "Grounded", "Hallucinated", "Partial".
 *     Each tab shows a count badge indicating how many claims match that filter.
 *   - A scrollable list of ClaimCard components filtered by the active tab.
 *   - An empty state message displayed when no claims match the current filter.
 *
 * Props:
 *   - claims          (VerifiedClaim[]): Array of all verified claims to display.
 *   - selectedClaimId (string | null): The id of the currently selected claim,
 *                     used to highlight the corresponding ClaimCard.
 *   - onSelectClaim   ((id: string) => void): Callback invoked when a claim card
 *                     is clicked, passing the claim's id.
 *
 * Outputs:
 *   - Renders a tabbed interface with a filtered, scrollable list of claim cards.
 */

import React, { useState, useMemo } from "react";
import type { VerifiedClaim, Verdict } from "@/lib";
import ClaimCard from "./ClaimCard";

interface ResultsDashboardProps {
  claims: VerifiedClaim[];
  selectedClaimId: string | null;
  onSelectClaim: (id: string) => void;
}

/**
 * FilterTab — A union type representing the available filter tab values.
 * "all" shows every claim; the Verdict values filter to that specific verdict.
 */
type FilterTab = "all" | Verdict;

/**
 * TAB_CONFIG — Configuration array defining the filter tabs displayed in
 * the dashboard header. Each entry maps a FilterTab value to its display label
 * and the corresponding verdict value (or null for "all").
 *
 * Inputs: None (constant).
 * Outputs: Array of { key, label, verdict } objects.
 */
const TAB_CONFIG: { key: FilterTab; label: string; verdict: Verdict | null }[] = [
  { key: "all", label: "All", verdict: null },
  { key: "grounded", label: "Grounded", verdict: "grounded" },
  { key: "ungrounded", label: "Hallucinated", verdict: "ungrounded" },
  { key: "partial", label: "Partial", verdict: "partial" },
];

/**
 * getTabCount — Returns the number of claims matching a given filter tab.
 *
 * Inputs:
 *   - claims (VerifiedClaim[]): The full array of verified claims.
 *   - verdict (Verdict | null): The verdict to filter by, or null for all claims.
 *
 * Returns:
 *   - number: The count of matching claims.
 */
function getTabCount(claims: VerifiedClaim[], verdict: Verdict | null): number {
  if (verdict === null) return claims.length;
  return claims.filter((c) => c.verdict === verdict).length;
}

export default function ResultsDashboard({
  claims,
  selectedClaimId,
  onSelectClaim,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  /**
   * filteredClaims — Memoized array of claims filtered by the currently active
   * tab. When the active tab is "all", all claims are returned; otherwise only
   * claims whose verdict matches the active tab's verdict are included.
   *
   * Inputs: claims array and activeTab state (via closure).
   * Outputs: VerifiedClaim[] filtered to the active tab.
   */
  const filteredClaims = useMemo(() => {
    if (activeTab === "all") return claims;
    return claims.filter((c) => c.verdict === activeTab);
  }, [claims, activeTab]);

  return (
    <div className="flex flex-col">
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-slate-200 pb-2">
        {TAB_CONFIG.map((tab) => {
          const count = getTabCount(claims, tab.verdict);
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  isActive
                    ? "bg-teal-100 text-teal-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrollable claims list */}
      <div className="mt-4 max-h-[600px] space-y-3 overflow-y-auto pr-1">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              isSelected={claim.id === selectedClaimId}
              onSelect={onSelectClaim}
            />
          ))
        ) : (
          /**
           * Empty state — Displayed when no claims match the currently active
           * filter tab. Shows a neutral message indicating no results.
           */
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12">
            <p className="text-sm text-slate-400">
              No claims match the current filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
