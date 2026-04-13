"use client";

/**
 * NoteInput -- Textarea component for entering an AI-generated clinical note
 * that will be verified against the conversation transcript.
 *
 * This component renders a labeled, monospaced textarea where the user pastes
 * the clinical note produced by an AI scribe. Each claim in this note will be
 * extracted and checked for hallucinations during analysis.
 *
 * Props:
 *   value    -- The current clinical note string (controlled component).
 *   onChange -- Callback invoked with the new string whenever the user types.
 *   disabled -- When true the textarea is visually dimmed (opacity-50) and
 *               non-interactive (pointer-events-none). Useful while an
 *               analysis is in progress. Default: false.
 *
 * Renders:
 *   A <label> with heading text, a helper paragraph, and a <textarea> element
 *   styled with Tailwind CSS (monospace font, minimum 300px height, full
 *   width, vertical resize).
 */

import React from "react";

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function NoteInput({
  value,
  onChange,
  disabled = false,
}: NoteInputProps) {
  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <label
        htmlFor="note-input"
        className="block text-sm font-semibold text-slate-900 mb-1"
      >
        AI-Generated Clinical Note
      </label>

      <p className="text-sm text-slate-500 mb-2">
        Paste the clinical note to verify against the transcript
      </p>

      <textarea
        id="note-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={
          "SUBJECTIVE:\nPatient presents with...\n\nOBJECTIVE:\nVitals: BP..."
        }
        className={[
          "min-h-[300px] w-full font-mono resize-y",
          "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
          "text-slate-900 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:cursor-not-allowed",
        ].join(" ")}
      />
    </div>
  );
}
