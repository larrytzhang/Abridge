# NoteCheck

Clinical note hallucination detector. Verifies AI-generated medical notes against doctor-patient conversation transcripts.

## What it does

1. Paste a conversation transcript and an AI-generated clinical note
2. The system extracts every factual claim from the note
3. Each claim is verified against the transcript as **grounded**, **hallucinated**, or **partially supported**
4. Results show evidence linking, confidence scores, and an exportable audit report

## Tech stack

- Next.js (App Router), TypeScript, React, Tailwind CSS
- OpenAI GPT-4o with structured outputs for claim extraction and verification
- Zod for input validation, in-memory rate limiting, OWASP security headers

## Setup

```bash
npm install
```

Create `.env.local`:
```
OPENAI_API_KEY=your-key-here
```

Run:
```bash
npm run dev
```

Open http://localhost:3000. Click **Try Demo** to see it work with sample data.

## Project structure

```
src/
  app/           # Next.js pages and API routes
  lib/           # Core logic (prompts, extraction, verification, validation)
  components/    # React components (UI primitives, analyze workspace, landing)
  hooks/         # useAnalysis state machine hook
  data/          # Demo transcript + note with embedded hallucinations
```
