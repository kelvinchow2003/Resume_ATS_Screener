// Engine 1: Legacy ATS — Pure TypeScript keyword frequency matching.
// Zero external dependencies. Runs locally in the API route.

import type { LegacyATSResult } from "@/types/evaluation";

const STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","also","am","an","and",
  "any","are","aren't","as","at","be","because","been","before","being","below",
  "between","both","but","by","can","can't","cannot","could","couldn't","did",
  "didn't","do","does","doesn't","doing","don't","down","during","each","few",
  "for","from","further","get","got","had","hadn't","has","hasn't","have",
  "haven't","having","he","he'd","he'll","he's","her","here","here's","hers",
  "herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've",
  "if","in","into","is","isn't","it","it's","its","itself","let's","me","more",
  "most","mustn't","my","myself","no","nor","not","of","off","on","once","only",
  "or","other","ought","our","ours","ourselves","out","over","own","same","shan't",
  "she","she'd","she'll","she's","should","shouldn't","so","some","such","than",
  "that","that's","the","their","theirs","them","themselves","then","there",
  "there's","these","they","they'd","they'll","they're","they've","this","those",
  "through","to","too","under","until","up","very","was","wasn't","we","we'd",
  "we'll","we're","we've","were","weren't","what","what's","when","when's",
  "where","where's","which","while","who","who's","whom","why","why's","will",
  "with","won't","would","wouldn't","you","you'd","you'll","you're","you've",
  "your","yours","yourself","yourselves",
  "work","working","will","role","team","company","business","position","job",
  "experience","years","ability","strong","excellent","good","great","new",
  "responsible","responsibilities","including","ensure","across","within",
  "make","use","using","used","help","need","well","able","must","plus","via",
  "etc","per","key","day","days","time","based","looking","require","required",
]);

const COMPOUND_PHRASES: string[] = [
  "machine learning","artificial intelligence","natural language processing",
  "data structures","design patterns","system design","distributed systems",
  "continuous integration","continuous deployment","test driven development",
  "object oriented","functional programming","version control",
  "rest api","graphql api","grpc","event driven","micro services",
  "next.js","react.js","node.js","vue.js","angular.js",
  "aws lambda","google cloud","azure devops",
  "row level security","full stack","front end","back end",
];

function normaliseWithPhrases(text: string): string {
  let lower = text.toLowerCase();
  for (const phrase of COMPOUND_PHRASES) {
    lower = lower.replace(new RegExp(phrase, "g"), phrase.replace(/\s+/g, "-"));
  }
  return lower;
}

export function extractKeywords(text: string): string[] {
  const normalised = normaliseWithPhrases(text);
  const tokens = normalised
    .replace(/[^a-z0-9\-+#.\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => {
      if (t.length < 2) return false;
      if (STOP_WORDS.has(t)) return false;
      if (/^\d+$/.test(t) && (t.length < 4 || +t < 1990 || +t > 2040)) return false;
      return true;
    });
  return [...new Set(tokens)];
}

export function runLegacyATS(
  resumeText: string,
  jobDescription: string
): LegacyATSResult {
  const jdKeywords = extractKeywords(jobDescription);
  const normalisedResume = normaliseWithPhrases(resumeText);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jdKeywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    if (pattern.test(normalisedResume)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchRate = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0;

  return {
    score: Math.round(matchRate * 1000) / 10,
    matchedKeywords: matched,
    missingKeywords: missing,
    totalJDKeywords: jdKeywords.length,
    matchRate,
  };
}