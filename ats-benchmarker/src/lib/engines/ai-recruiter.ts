// Engine 3: Google Gemini 1.5 Flash — structured JSON evaluation.
// Prompt-engineered to return ONLY a typed JSON object.

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { AIRecruiterResult } from "@/types/evaluation";

const MODEL_NAME = "gemini-1.5-flash";

const SYSTEM_INSTRUCTION = `You are a ruthlessly objective senior technical recruiter at a Fortune 500 company.
Evaluate the resume against the job description and return ONLY a raw JSON object.
No markdown, no code fences, no backticks, no preamble, no explanation.

JSON Schema (all fields required):
{
  "Score": <integer 0-100>,
  "Verdict": <"Strong Match" | "Moderate Match" | "Weak Match" | "Not a Fit">,
  "Feedback": <2-3 sentence holistic assessment>,
  "Pros": <array of 3-5 specific strengths with evidence>,
  "Cons": <array of 3-5 specific gaps with explanation>
}

Scoring: 85-100 near-perfect, 65-84 good fit, 45-64 partial, 25-44 weak, 0-24 not a fit.
Focus on: technical stack alignment, quantified impact, seniority match, industry fit.`;

function validateAIResult(obj: unknown): obj is AIRecruiterResult {
  if (typeof obj !== "object" || obj === null) throw new Error("Response is not an object.");
  const r = obj as Record<string, unknown>;
  const validVerdicts = ["Strong Match", "Moderate Match", "Weak Match", "Not a Fit"];
  if (typeof r.Score !== "number" || r.Score < 0 || r.Score > 100) throw new Error(`Invalid Score: ${r.Score}`);
  if (!validVerdicts.includes(r.Verdict as string)) throw new Error(`Invalid Verdict: ${r.Verdict}`);
  if (typeof r.Feedback !== "string" || r.Feedback.length < 10) throw new Error(`Invalid Feedback`);
  if (!Array.isArray(r.Pros) || r.Pros.length === 0) throw new Error("Pros must be non-empty array.");
  if (!Array.isArray(r.Cons) || r.Cons.length === 0) throw new Error("Cons must be non-empty array.");
  return true;
}

function extractJSON(raw: string): string {
  let clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in Gemini response.");
  return clean.slice(start, end + 1);
}

export async function runAIRecruiter(
  resumeText: string,
  jobDescription: string
): Promise<AIRecruiterResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
  });

  const result = await model.generateContent(
    `RESUME:\n---\n${resumeText.slice(0, 4000)}\n---\n\nJOB DESCRIPTION:\n---\n${jobDescription.slice(0, 3000)}\n---\n\nReturn ONLY the JSON object.`
  );

  const jsonString = extractJSON(result.response.text());

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Failed to parse Gemini JSON: ${(e as Error).message}. Raw: ${jsonString.slice(0, 200)}`);
  }

  validateAIResult(parsed);
  return parsed as AIRecruiterResult;
}