"use client";

/**
 * SummaryStats — Displays analysis results as a compact stats bar with
 * an inline accuracy score, avoiding the centered-big-number AI pattern.
 *
 * Layout:
 *   - Top row: overall accuracy score (left-aligned) with colored indicator
 *   - Bottom row: 3 verdict counts as compact inline chips
 *
 * Props:
 *   summary (AnalysisSummary) — aggregate stats from verification
 * Renders: a compact stats section with accuracy and verdict breakdowns
 */

import React from "react";
import type { AnalysisSummary } from "@/lib";

interface SummaryStatsProps {
  summary: AnalysisSummary;
}

/**
 * getPercentage — Computes percentage of count relative to total.
 * Returns 0 when total is zero to avoid division-by-zero.
 *
 * @param count — numerator
 * @param total — denominator
 * @returns rounded percentage 0-100
 */
function getPercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

/**
 * getScoreColor — Returns Tailwind classes for accuracy indicator bar.
 *
 * @param score — overall accuracy 0-100
 * @returns object with bg and text color classes
 */
function getScoreColor(score: number): { bg: string; text: string } {
  if (score > 70) return { bg: "bg-green-500", text: "text-green-700" };
  if (score > 40) return { bg: "bg-amber-500", text: "text-amber-700" };
  return { bg: "bg-red-500", text: "text-red-700" };
}

export default function SummaryStats({ summary }: SummaryStatsProps) {
  const { total_claims, grounded, ungrounded, partial, overall_score } = summary;
  const colors = getScoreColor(overall_score);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      {/* Accuracy row */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>
            {overall_score}%
          </span>
          <span className="ml-2 text-[13px] text-slate-500">accuracy</span>
        </div>
        <span className="text-[13px] text-slate-400">
          {total_claims} claims analyzed
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full">
        {grounded > 0 && (
          <div
            className="bg-green-500 rounded-l-full"
            style={{ width: `${getPercentage(grounded, total_claims)}%` }}
          />
        )}
        {partial > 0 && (
          <div
            className="bg-amber-400"
            style={{ width: `${getPercentage(partial, total_claims)}%` }}
          />
        )}
        {ungrounded > 0 && (
          <div
            className="bg-red-500 rounded-r-full"
            style={{ width: `${getPercentage(ungrounded, total_claims)}%` }}
          />
        )}
      </div>

      {/* Verdict breakdown */}
      <div className="mt-4 flex gap-4 text-[13px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-slate-600">
            {grounded} grounded
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-slate-600">
            {ungrounded} hallucinated
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="text-slate-600">
            {partial} partial
          </span>
        </div>
      </div>
    </div>
  );
}
