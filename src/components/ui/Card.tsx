/**
 * Card — A simple presentational wrapper that provides a consistent
 * container style across the NoteCheck application.
 *
 * Renders a white-background box with rounded corners, a subtle shadow,
 * a light slate border, and internal padding. Use it to visually group
 * related content into discrete sections.
 *
 * Props:
 *   children  — The content to render inside the card.
 *   className — Optional extra Tailwind classes merged onto the root element,
 *               allowing callers to override or extend default styles.
 *
 * Renders: a <div> with the card styling applied, wrapping its children.
 */

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-lg shadow-sm border border-slate-200 p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
