// =============================================================================
// src/types/supabase.ts
// Supabase database type helpers.
// You can replace this with auto-generated types from the Supabase CLI:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
// =============================================================================

// Re-export evaluation types for convenience
export type {
  EvaluationRow,
  LegacyATSResult,
  SemanticATSResult,
  AIRecruiterResult,
  EvaluationResult,
} from "./evaluation";

// Database shape (matches your Supabase schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          parsed_text: string;
          char_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          parsed_text: string;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          parsed_text?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string;
          job_description: string;
          legacy_score: number | null;
          legacy_matched: string[] | null;
          legacy_missing: string[] | null;
          legacy_details: Record<string, unknown> | null;
          semantic_score: number | null;
          semantic_details: Record<string, unknown> | null;
          ai_score: number | null;
          ai_verdict: string | null;
          ai_feedback: string | null;
          ai_pros: string[] | null;
          ai_cons: string[] | null;
          ai_details: Record<string, unknown> | null;
          composite_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string;
          job_description: string;
          legacy_score?: number | null;
          legacy_matched?: string[] | null;
          legacy_missing?: string[] | null;
          legacy_details?: Record<string, unknown> | null;
          semantic_score?: number | null;
          semantic_details?: Record<string, unknown> | null;
          ai_score?: number | null;
          ai_verdict?: string | null;
          ai_feedback?: string | null;
          ai_pros?: string[] | null;
          ai_cons?: string[] | null;
          ai_details?: Record<string, unknown> | null;
        };
        Update: Partial<Database["public"]["Tables"]["evaluations"]["Insert"]>;
      };
    };
  };
};