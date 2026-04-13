/**
 * Library Public Interface (Barrel Export)
 *
 * This module serves as the single public entry point for the src/lib folder.
 * All consumers outside of src/lib (e.g., API routes in app/api, React
 * components, hooks) should import exclusively from "@/lib" -- never from
 * internal modules like "@/lib/openai", "@/lib/prompts", or "@/lib/types"
 * directly.
 *
 * Exported surface:
 *   - All type definitions (Claim, VerifiedClaim, etc.) from "./types"
 *   - extractClaims()  -- extracts verifiable claims from a clinical note
 *   - verifyClaims()   -- checks claims against a source transcript
 *
 * Intentionally NOT exported (implementation details):
 *   - The OpenAI client singleton (./openai)
 *   - Prompt templates and JSON schemas (./prompts)
 *
 * @example
 *   import { extractClaims, verifyClaims, type Claim } from "@/lib";
 */

export type {
  Claim,
  VerifiedClaim,
  AnalysisResult,
  AnalysisSummary,
  Evidence,
  ExtractClaimsRequest,
  ExtractClaimsResponse,
  VerifyClaimsRequest,
  VerifyClaimsResponse,
  Verdict,
  ClaimCategory,
  SOAPSection,
} from "./types";

export { extractClaims } from "./claim-extractor";
export { verifyClaims } from "./claim-verifier";
