// =============================================================================
// src/types/evaluation.ts
// Shared TypeScript interfaces aligned with the Supabase schema.
// These types are the single source of truth for all 3 engines and the UI.
// =============================================================================

// Engine 1: Legacy ATS (Keyword Matcher)
export interface LegacyATSResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalJDKeywords: number;
  matchRate: number;
}

// Engine 2: Semantic ATS (Cohere Embeddings)
export interface SemanticATSResult {
  score: number;
  rawSimilarity: number;
  interpretation: string;
}

// Engine 3: AI Recruiter (Gemini LLM)
// This is the exact JSON shape Gemini is prompted to return.
export interface AIRecruiterResult {
  Score: number;
  Verdict: "Strong Match" | "Moderate Match" | "Weak Match" | "Not a Fit";
  Feedback: string;
  Pros: string[];
  Cons: string[];
}

// Composite Evaluation — full result from all 3 engines
export interface EvaluationResult {
  id?: string;
  resumeId?: string;
  jobDescription: string;
  legacy: LegacyATSResult;
  semantic: SemanticATSResult;
  aiRecruiter: AIRecruiterResult;
  // Legacy 30% + Semantic 30% + AI Recruiter 40%
  compositeScore: number;
  createdAt?: string;
}

// --- API request/response payloads ---

export interface ParsePDFResponse {
  text: string;
  charCount: number;
  pageCount: number;
}

export interface LegacyEngineRequest  { resumeText: string; jobDescription: string; }
export type   LegacyEngineResponse = LegacyATSResult;

export interface SemanticEngineRequest  { resumeText: string; jobDescription: string; }
export type   SemanticEngineResponse = SemanticATSResult;

export interface AIRecruiterRequest  { resumeText: string; jobDescription: string; }
export type   AIRecruiterResponse = AIRecruiterResult;

export interface APIError { error: string; detail?: string; }

// Supabase DB row (mirrors `evaluations` table columns)
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
  composite_score: number | null;   // Generated column — read-only
  created_at: string;
}