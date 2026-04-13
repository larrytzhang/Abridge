import Link from "next/link";

/**
 * LandingPage — Marketing page for NoteCheck.
 *
 * Design: left-aligned hero, narrative flow, asymmetric features grid.
 * Avoids AI-generated patterns: no numbered circles, no centered-everything,
 * no symmetrical 3-column grids.
 *
 * Props: none (Next.js page component)
 * Renders: hero, process section, features, and CTA
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero — left-aligned, not centered */}
      <section className="mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-teal-600">
          Clinical note verification
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Every claim in the note.
          <br />
          Checked against the conversation.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-500">
          AI medical scribes can hallucinate — fabricating drug names, inflating
          severity scores, reversing diagnoses. NoteCheck catches it before the
          note hits the chart.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/analyze?demo=true"
            className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            Try the demo
          </Link>
          <Link
            href="/analyze"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Paste your own
          </Link>
        </div>
      </section>

      {/* Process — horizontal timeline, not numbered circles */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
          <div className="mt-8 grid grid-cols-1 gap-px sm:grid-cols-3">
            <ProcessStep
              step="01"
              title="Paste"
              description="Drop in the conversation transcript and the AI-generated clinical note."
            />
            <ProcessStep
              step="02"
              title="Extract"
              description="Each factual assertion in the note is isolated as a verifiable claim."
            />
            <ProcessStep
              step="03"
              title="Verify"
              description="Every claim is checked against the transcript — grounded, hallucinated, or partial."
            />
          </div>
        </div>
      </section>

      {/* Features — asymmetric, not a 2x2 grid of identical cards */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900">
            What you get
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2 rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900">
                Claim-level granularity
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                The note isn&apos;t checked as a whole — every atomic assertion is
                extracted and verified independently. A note with 30 claims might
                have 25 grounded and 5 hallucinated. You&apos;ll see exactly which 5.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900">
                Evidence linking
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Click any claim to see the exact transcript lines that
                support or contradict it.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900">
                Confidence scoring
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Each claim gets a 0–100% confidence score so you can prioritize
                review on the most uncertain findings.
              </p>
            </div>
            <div className="sm:col-span-2 rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900">
                Exportable audit reports
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Download a full hallucination audit in Markdown — every claim,
                verdict, evidence quote, and reasoning step. Ready for
                documentation, compliance review, or sharing with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — minimal, not a dark hero */}
      <section className="border-t border-slate-100 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                See it on real clinical data.
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                The demo includes a doctor-patient transcript with 15 embedded
                hallucinations in the note.
              </p>
            </div>
            <Link
              href="/analyze?demo=true"
              className="shrink-0 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
            >
              Try the demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * ProcessStep — Single step in the "How it works" section.
 * Uses a monospace step number instead of numbered circles.
 *
 * @param step — step number as string (e.g., "01")
 * @param title — short step title
 * @param description — one-sentence description
 * @returns styled step block
 */
function ProcessStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-l border-slate-200 py-1 pl-6 first:border-l-0 first:pl-0 sm:border-l sm:first:border-l-0">
      <span className="font-mono text-xs text-slate-400">{step}</span>
      <h3 className="mt-1 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}
