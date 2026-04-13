"use client";

/**
 * Badge — A small color-coded pill used to indicate the verification status
 * of a clinical note claim.
 *
 * Three variants map to the hallucination-detection domain:
 *   "grounded"   — green (bg-green-100 / text-green-700): the claim is
 *                  supported by the source transcript.
 *   "ungrounded" — red (bg-red-100 / text-red-700): the claim has no
 *                  supporting evidence and may be hallucinated.
 *   "partial"    — amber (bg-amber-100 / text-amber-700): the claim is
 *                  partially supported or ambiguous.
 *
 * Props:
 *   variant   — One of "grounded", "ungrounded", or "partial".
 *   children  — The label text displayed inside the badge.
 *   className — Optional extra Tailwind classes merged onto the root element.
 *
 * Renders: a compact <span> pill with the appropriate background and text
 *          color for the given variant.
 */

import React from "react";

interface BadgeProps {
  variant: "grounded" | "ungrounded" | "partial";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  grounded: "bg-green-100 text-green-700",
  ungrounded: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
};

export default function Badge({
  variant,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
