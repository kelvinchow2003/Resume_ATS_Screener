// src/lib/engines/legacy.ts

export interface LegacyATSResult {
  score: number;           // 0–100
  matchedKeywords: string[];
  missingKeywords: string[];
  totalJDKeywords: number;
  matchRate: number;       // raw ratio 0–1
}

/**
 * Extracts significant keywords from a text block.
 * Filters out common stop words and short tokens.
 */
function extractKeywords(text: string): string[] {
  const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "our", "your",
    "their", "its", "we", "you", "they", "it", "he", "she", "this", "that",
    "as", "not", "also", "such", "any", "all", "more", "than", "into",
  ]);

  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9#+.\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    ),
  ];
}

/**
 * Engine 1: Pure keyword frequency matching.
 * Compares JD keywords against resume text.
 */
export function runLegacyATS(
  resumeText: string,
  jobDescription: string
): LegacyATSResult {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jdKeywords) {
    // Use word-boundary regex for precision
    const pattern = new RegExp(`\\b${keyword.replace(/[.+#]/g, "\\$&")}\\b`);
    if (pattern.test(resumeLower)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchRate = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0;

  return {
    score: Math.round(matchRate * 100 * 10) / 10,
    matchedKeywords: matched,
    missingKeywords: missing,
    totalJDKeywords: jdKeywords.length,
    matchRate,
  };
}