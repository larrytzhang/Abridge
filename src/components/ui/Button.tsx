"use client";

/**
 * Button — A reusable, accessible button component for the NoteCheck UI.
 *
 * Provides three visual variants (primary, secondary, ghost) and three sizes
 * (sm, md, lg). Supports a loading state that disables interaction and shows
 * an inline spinner, plus a standard disabled state.
 *
 * Props:
 *   variant   — "primary" (filled blue-600), "secondary" (outlined blue-600),
 *               or "ghost" (transparent with hover highlight). Default: "primary".
 *   size      — "sm", "md", or "lg" controlling padding and font size.
 *               Default: "md".
 *   disabled  — When true the button is visually dimmed and non-interactive.
 *   loading   — When true an animated spinner replaces normal interaction;
 *               the button is also implicitly disabled.
 *   onClick   — Optional click handler.
 *   children  — Button label / content.
 *   className — Optional extra Tailwind classes merged onto the root element.
 *   type      — HTML button type attribute. Default: "button".
 *
 * Renders: a styled <button> element with the appropriate variant, size,
 *          and state classes applied via Tailwind CSS.
 */

import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary:
    "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  children,
  className = "",
  type = "button",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md font-medium",
        "transition-colors duration-150 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
