"use client";

/**
 * TranscriptHighlight — Renders the conversation transcript as a scrollable,
 * line-numbered panel with configurable line highlighting.
 *
 * Each transcript line is displayed with a 1-indexed line number gutter and
 * monospace font. Lines whose indices fall within any of the provided
 * highlightRanges receive a colored background determined by highlightColor.
 *
 * Auto-scroll behavior:
 *   When highlightRanges changes, the component automatically smooth-scrolls
 *   the first highlighted line into view using a ref + useEffect + scrollIntoView.
 *
 * Props:
 *   - transcriptLines  (string[]): Array of transcript lines to render.
 *   - highlightRanges  ([number, number][]): Array of [start, end] line-number
 *                      pairs (1-indexed, inclusive) indicating which lines to
 *                      highlight. A line is highlighted if its 1-based index
 *                      falls within any range.
 *   - highlightColor   ("green" | "red" | "amber"): Determines the background
 *                      color applied to highlighted lines:
 *                        "green" -> bg-green-100
 *                        "red"   -> bg-red-100
 *                        "amber" -> bg-amber-100
 *
 * Outputs:
 *   - Renders a scrollable, monospace transcript viewer with optional line
 *     highlighting and automatic scroll-to-highlight behavior.
 */

import React, { useEffect, useRef, useMemo } from "react";

interface TranscriptHighlightProps {
  transcriptLines: string[];
  highlightRanges: [number, number][];
  highlightColor: "green" | "red" | "amber";
}

/**
 * HIGHLIGHT_BG_MAP — Maps a highlight color name to the corresponding Tailwind
 * background color class applied to highlighted transcript lines.
 *
 * Inputs: None (constant).
 * Outputs: Record mapping color names to Tailwind classes.
 */
const HIGHLIGHT_BG_MAP: Record<string, string> = {
  green: "bg-green-100",
  red: "bg-red-100",
  amber: "bg-amber-100",
};

/**
 * isLineHighlighted — Determines whether a given 1-indexed line number falls
 * within any of the provided highlight ranges.
 *
 * Inputs:
 *   - lineNumber (number): The 1-indexed line number to check.
 *   - ranges ([number, number][]): Array of [start, end] inclusive ranges.
 *
 * Returns:
 *   - boolean: true if the line number is within at least one range.
 */
function isLineHighlighted(
  lineNumber: number,
  ranges: [number, number][]
): boolean {
  return ranges.some(([start, end]) => lineNumber >= start && lineNumber <= end);
}

export default function TranscriptHighlight({
  transcriptLines,
  highlightRanges,
  highlightColor,
}: TranscriptHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstHighlightRef = useRef<HTMLDivElement>(null);

  /**
   * highlightedLineSet — A memoized Set of 1-indexed line numbers that should
   * be highlighted, computed from the highlightRanges prop. Using a Set provides
   * O(1) lookup per line during rendering.
   *
   * Inputs: highlightRanges (via closure).
   * Outputs: Set<number> containing all highlighted line numbers.
   */
  const highlightedLineSet = useMemo(() => {
    const set = new Set<number>();
    for (const [start, end] of highlightRanges) {
      for (let i = start; i <= end; i++) {
        set.add(i);
      }
    }
    return set;
  }, [highlightRanges]);

  /**
   * firstHighlightedLine — The smallest 1-indexed line number that is
   * highlighted, or -1 if no lines are highlighted. Used to determine
   * which element to scroll into view.
   *
   * Inputs: highlightRanges (via closure).
   * Outputs: number (1-indexed line number or -1).
   */
  const firstHighlightedLine = useMemo(() => {
    if (highlightRanges.length === 0) return -1;
    let min = Infinity;
    for (const [start] of highlightRanges) {
      if (start < min) min = start;
    }
    return min;
  }, [highlightRanges]);

  /**
   * Auto-scroll effect — When the highlight ranges change, smoothly scrolls
   * the first highlighted line into view within the container. Uses a short
   * timeout to ensure the DOM has rendered the highlighted element before
   * attempting to scroll.
   *
   * Inputs: firstHighlightedLine (dependency).
   * Outputs: Side effect (DOM scroll).
   */
  useEffect(() => {
    if (firstHighlightedLine > 0 && firstHighlightRef.current) {
      firstHighlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [firstHighlightedLine]);

  const bgClass = HIGHLIGHT_BG_MAP[highlightColor] || "bg-yellow-100";

  return (
    <div
      ref={containerRef}
      className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-white"
    >
      <div className="font-mono text-sm">
        {transcriptLines.map((line, index) => {
          const lineNumber = index + 1;
          const isHighlighted = highlightedLineSet.has(lineNumber);
          const isFirstHighlight = lineNumber === firstHighlightedLine;

          return (
            <div
              key={lineNumber}
              ref={isFirstHighlight ? firstHighlightRef : undefined}
              className={`flex ${isHighlighted ? bgClass : ""}`}
            >
              {/* Line number gutter */}
              <span className="flex w-12 shrink-0 select-none items-start justify-end pr-3 pt-0.5 text-xs text-gray-400">
                {lineNumber}
              </span>
              {/* Line content */}
              <span
                className={`flex-1 whitespace-pre-wrap break-words px-2 py-0.5 ${
                  isHighlighted ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {line || "\u00A0"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
