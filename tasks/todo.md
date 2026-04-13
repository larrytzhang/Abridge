# Clinical Note Hallucination Detector — Todo

## Phase 1: Scaffold
- [x] Create Next.js project (TypeScript + Tailwind + App Router)
- [x] Install openai package
- [x] Create .env.local
- [x] Set up folder structure + barrel exports

## Phase 2: Core Logic
- [x] src/lib/types.ts — all interfaces
- [x] src/lib/openai.ts — client singleton
- [x] src/lib/prompts.ts — extraction + verification prompts + JSON schemas
- [x] src/lib/claim-extractor.ts — extraction logic
- [x] src/lib/claim-verifier.ts — verification logic
- [x] src/lib/index.ts — public interface (barrel export)
- [x] src/app/api/extract-claims/route.ts
- [x] src/app/api/verify-claims/route.ts
- [x] Fixed import name mismatches between prompts.ts and consumers
- [x] TypeScript compiles clean

## Phase 3: Demo Data
- [x] src/data/demo.ts — transcript + note with embedded hallucinations

## Phase 4: UI Foundation
- [x] UI primitives (Button, Card, Textarea, Badge)
- [x] Root layout + header
- [x] Analyze page shell (two-column)
- [x] TranscriptInput, NoteInput, AnalysisControls

## Phase 5: Analysis Flow
- [x] useAnalysis hook (state machine)
- [x] SummaryStats component
- [x] ClaimCard component
- [x] ResultsDashboard (filterable list)
- [x] TranscriptHighlight (highlighted evidence)
- [x] Wire "Try Demo" button + full page wiring

## Phase 6: Export + Polish
- [x] ExportButton component (inline markdown generation)
- [x] Loading state messaging in results panel
- [x] Error handling UI (red alert box)

## Phase 7: Landing Page
- [x] Hero section
- [x] HowItWorks section
- [x] Features section
- [x] CallToAction section

## Phase 8: Final Testing
- [x] TypeScript compiles clean (tsc --noEmit)
- [x] Next.js build passes (npm run build)
- [x] Dev server starts, all routes return 200
- [x] Landing page renders hero text
- [x] API validation rejects empty bodies
- [ ] End-to-end demo with real OpenAI key (requires user's key)

## Review
(to be filled after completion)
