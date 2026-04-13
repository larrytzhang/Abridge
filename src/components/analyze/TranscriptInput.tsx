"use client";

/**
 * TranscriptInput -- Textarea component for entering a doctor-patient
 * conversation transcript.
 *
 * This component renders a labeled, monospaced textarea where the user pastes
 * the raw conversation transcript that will serve as the ground-truth source
 * during hallucination detection. The transcript is compared against the
 * AI-generated clinical note to determine which claims are grounded.
 *
 * Props:
 *   value    -- The current transcript string (controlled component).
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

interface TranscriptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TranscriptInput({
  value,
  onChange,
  disabled = false,
}: TranscriptInputProps) {
  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <label
        htmlFor="transcript-input"
        className="block text-sm font-semibold text-slate-900 mb-1"
      >
        Conversation Transcript
      </label>

      <p className="text-sm text-slate-500 mb-2">
        Paste the doctor-patient conversation transcript
      </p>

      <textarea
        id="transcript-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={
          "Dr. Smith: How are you feeling today?\nPatient: I've been having headaches..."
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
