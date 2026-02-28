// Engine 2: Cohere embeddings + cosine similarity.
// Free tier: 1,000 API calls/month.

import { CohereClient } from "cohere-ai";
import type { SemanticATSResult } from "@/types/evaluation";

const COHERE_EMBED_MODEL = "embed-english-v3.0";
const MAX_INPUT_CHARS = 4096;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function similarityToScore(sim: number): number {
  const clamped = Math.max(0, Math.min(1, sim));
  const stretched = Math.max(0, (clamped - 0.3) / 0.7);
  return Math.round(Math.pow(stretched, 0.75) * 100 * 10) / 10;
}

function interpretScore(score: number): string {
  if (score >= 80) return "Excellent contextual alignment";
  if (score >= 65) return "Strong contextual alignment";
  if (score >= 50) return "Moderate contextual alignment";
  if (score >= 35) return "Weak contextual alignment";
  return "Poor contextual alignment";
}

export async function runSemanticATS(
  resumeText: string,
  jobDescription: string
): Promise<SemanticATSResult> {
  const cohere = new CohereClient({ token: process.env.COHERE_API_KEY! });

  const response = await cohere.embed({
    texts: [resumeText.slice(0, MAX_INPUT_CHARS), jobDescription.slice(0, MAX_INPUT_CHARS)],
    model: COHERE_EMBED_MODEL,
    inputType: "search_document",
  });

  const embeddings = response.embeddings;
  if (!Array.isArray(embeddings) || embeddings.length < 2) {
    throw new Error("Cohere returned fewer embeddings than expected.");
  }

  const rawSimilarity = cosineSimilarity(embeddings[0] as number[], embeddings[1] as number[]);
  const score = similarityToScore(rawSimilarity);

  return {
    score,
    rawSimilarity: Math.round(rawSimilarity * 10000) / 10000,
    interpretation: interpretScore(score),
  };
}