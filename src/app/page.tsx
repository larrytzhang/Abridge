import Link from "next/link";

/**
 * LandingPage — Marketing page for NoteCheck. Explains what the tool does,
 * how it works, key features, and drives users to try the demo.
 *
 * Sections: Hero, How It Works (3 steps), Features, Call to Action.
 * Props: none (Next.js page component)
 * Renders: full landing page with navigation to /analyze
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Every claim.{" "}
            <span className="text-blue-600">Verified.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Detect hallucinations in AI-generated clinical notes before they
            reach the patient chart. Every factual claim is extracted, checked
            against the conversation transcript, and flagged with evidence.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/analyze?demo=true"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Try the Demo
            </Link>
            <Link
              href="/analyze"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Analyze Your Own
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
            Three steps to verify any AI-generated clinical note.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Paste
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Input the conversation transcript and the AI-generated clinical
                note.
              </p>
            </div>
            {/* Step 2 */}
            <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Analyze
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                The system breaks the note into individual claims and checks each
                one against the transcript.
              </p>
            </div>
            {/* Step 3 */}
            <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Verify
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                See which claims are grounded, hallucinated, or partially
                supported — with linked evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Built for Clinical AI Teams
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FeatureItem
              title="Claim-Level Granularity"
              description="Every factual assertion in the note is extracted and verified individually — nothing slips through."
            />
            <FeatureItem
              title="Confidence Scoring"
              description="Each claim gets a 0-100% confidence score so you can prioritize review on the most uncertain findings."
            />
            <FeatureItem
              title="Evidence Linking"
              description="Click any claim to see the exact transcript lines that support or contradict it."
            />
            <FeatureItem
              title="Exportable Reports"
              description="Download a full hallucination audit report in Markdown for documentation and compliance."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Stop shipping hallucinations.
          </h2>
          <p className="mt-4 text-slate-400">
            Built for clinical AI teams who demand accuracy in every generated
            note.
          </p>
          <Link
            href="/analyze?demo=true"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Try the Demo Now
          </Link>
        </div>
      </section>
    </div>
  );
}

/**
 * FeatureItem — Renders a single feature card with title and description.
 *
 * @param title       — short feature name
 * @param description — one-sentence explanation of the feature
 * @returns a styled feature card
 */
function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
