// =============================================================================
// src/types/evaluation.ts
// Shared TypeScript interfaces aligned with the Supabase schema.
// Single source of truth for all 3 engines, API routes, and UI components.
// =============================================================================

// -----------------------------------------------------------------------------
// Engine 1: Legacy ATS (Keyword Matcher)
// -----------------------------------------------------------------------------
export interface LegacyATSResult {
  score: number;              // 0–100 percentage
  matchedKeywords: string[];  // Keywords from JD found in resume
  missingKeywords: string[];  // Keywords from JD NOT found in resume
  totalJDKeywords: number;    // Total unique keywords extracted from JD
  matchRate: number;          // Raw ratio 0–1
}

// -----------------------------------------------------------------------------
// Engine 2: Semantic ATS (Cohere Embeddings)
// -----------------------------------------------------------------------------
export interface SemanticATSResult {
  score: number;              // Cosine similarity mapped to 0–100
  rawSimilarity: number;      // Raw cosine similarity value
  interpretation: string;     // e.g. "Strong contextual alignment"
}

// -----------------------------------------------------------------------------
// Engine 3: AI Recruiter (Gemini LLM)
// This is the exact JSON shape Gemini is prompted to return.
// -----------------------------------------------------------------------------
export interface AIRecruiterResult {
  Score: number;
  Verdict: "Strong Match" | "Moderate Match" | "Weak Match" | "Not a Fit";
  Feedback: string;
  Pros: string[];
  Cons: string[];
}

// -----------------------------------------------------------------------------
// Composite Evaluation — full result from all 3 engines combined
// -----------------------------------------------------------------------------
export interface EvaluationResult {
  id?: string;
  resumeId?: string;
  jobDescription: string;
  legacy: LegacyATSResult;
  semantic: SemanticATSResult;
  aiRecruiter: AIRecruiterResult;
  // Weighted: Legacy 30% + Semantic 30% + AI Recruiter 40%
  compositeScore: number;
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// API request / response payload types
// -----------------------------------------------------------------------------

/** POST /api/parse-pdf */
export interface ParsePDFResponse {
  text: string;
  charCount: number;
  pageCount: number;
}

/** POST /api/engines/legacy */
export interface LegacyEngineRequest {
  resumeText: string;
  jobDescription: string;
}
export type LegacyEngineResponse = LegacyATSResult;

/** POST /api/engines/semantic */
export interface SemanticEngineRequest {
  resumeText: string;
  jobDescription: string;
}
export type SemanticEngineResponse = SemanticATSResult;

/** POST /api/engines/ai-recruiter */
export interface AIRecruiterRequest {
  resumeText: string;
  jobDescription: string;
}
export type AIRecruiterResponse = AIRecruiterResult;

/** Generic API error shape returned by all routes on failure */
export interface APIError {
  error: string;
  detail?: string;
}

// -----------------------------------------------------------------------------
// Supabase DB row — mirrors the `evaluations` table columns exactly
// composite_score is a generated column (read-only, do not insert it)
// -----------------------------------------------------------------------------
export interface EvaluationRow {
  id: string;
  user_id: string;
  resume_id: string;
  job_description: string;

  legacy_score: number | null;
  legacy_matched: string[] | null;
  legacy_missing: string[] | null;
  legacy_details: LegacyATSResult | null;

  semantic_score: number | null;
  semantic_details: SemanticATSResult | null;

  ai_score: number | null;
  ai_verdict: string | null;
  ai_feedback: string | null;
  ai_pros: string[] | null;
  ai_cons: string[] | null;
  ai_details: AIRecruiterResult | null;

  composite_score: number | null;  // Generated column — never insert this
  created_at: string;
}