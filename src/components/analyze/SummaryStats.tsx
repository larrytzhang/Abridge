"use client";

/**
 * SummaryStats — Displays aggregate analysis statistics as a set of summary
 * cards plus a prominent overall accuracy score.
 *
 * Layout:
 *   - A 4-card grid showing:
 *       1. Total Claims (slate color)
 *       2. Grounded count and percentage (green-600)
 *       3. Hallucinated count and percentage (red-600)
 *       4. Partial count and percentage (amber-500)
 *   - A large overall accuracy score displayed below the grid, color-coded:
 *       - Green (text-green-600) if score > 70
 *       - Amber (text-amber-500) if score > 40 and <= 70
 *       - Red (text-red-600) if score <= 40
 *
 * Props:
 *   - summary (AnalysisSummary): The aggregate statistics object containing
 *     total_claims, grounded, ungrounded, partial counts and overall_score.
 *
 * Outputs:
 *   - Renders a responsive grid of stat cards and a color-coded accuracy score.
 */

import React from "react";
import type { AnalysisSummary } from "@/lib";

interface SummaryStatsProps {
  summary: AnalysisSummary;
}

/**
 * getPercentage — Computes the percentage of a count relative to a total,
 * returning 0 when the total is zero to avoid division-by-zero.
 *
 * Inputs:
 *   - count (number): The numerator value.
 *   - total (number): The denominator value.
 *
 * Returns:
 *   - number: The rounded percentage (0-100).
 */
function getPercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

/**
 * getScoreColor — Returns the appropriate Tailwind text color class for the
 * overall accuracy score based on threshold boundaries.
 *
 * Inputs:
 *   - score (number): The overall accuracy score (0-100).
 *
 * Returns:
 *   - string: A Tailwind text color class:
 *     "text-green-600" if score > 70,
 *     "text-amber-500" if score > 40,
 *     "text-red-600" if score <= 40.
 */
function getScoreColor(score: number): string {
  if (score > 70) return "text-green-600";
  if (score > 40) return "text-amber-500";
  return "text-red-600";
}

export default function SummaryStats({ summary }: SummaryStatsProps) {
  const { total_claims, grounded, ungrounded, partial, overall_score } = summary;

  const cards = [
    {
      label: "Total Claims",
      count: total_claims,
      percentage: null,
      colorClass: "text-slate-700",
      borderClass: "border-slate-200",
      bgClass: "bg-slate-50",
    },
    {
      label: "Grounded",
      count: grounded,
      percentage: getPercentage(grounded, total_claims),
      colorClass: "text-green-600",
      borderClass: "border-green-200",
      bgClass: "bg-green-50",
    },
    {
      label: "Hallucinated",
      count: ungrounded,
      percentage: getPercentage(ungrounded, total_claims),
      colorClass: "text-red-600",
      borderClass: "border-red-200",
      bgClass: "bg-red-50",
    },
    {
      label: "Partial",
      count: partial,
      percentage: getPercentage(partial, total_claims),
      colorClass: "text-amber-500",
      borderClass: "border-amber-200",
      bgClass: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border ${card.borderClass} ${card.bgClass} p-4`}
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.colorClass}`}>
              {card.count}
            </p>
            {card.percentage !== null && (
              <p className={`text-sm ${card.colorClass}`}>
                {card.percentage}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Overall accuracy score */}
      <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm font-medium text-gray-500">Overall Accuracy</p>
        <p className={`mt-1 text-5xl font-extrabold ${getScoreColor(overall_score)}`}>
          {overall_score}
        </p>
        <p className="mt-1 text-sm text-gray-400">out of 100</p>
      </div>
    </div>
  );
}
