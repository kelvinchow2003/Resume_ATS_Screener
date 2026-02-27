// src/lib/engines/ai-recruiter.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIRecruiterResult {
  Score: number;       // 0–100
  Verdict: string;     // e.g. "Strong Match" | "Moderate Match" | "Weak Match"
  Feedback: string;    // 2–3 sentence overall assessment
  Pros: string[];      // 3–5 strengths
  Cons: string[];      // 3–5 areas for improvement
}

const SYSTEM_PROMPT = `You are a senior technical recruiter at a Fortune 500 company. 
You will evaluate a resume against a job description and return ONLY a raw JSON object — no markdown, no code fences, no preamble.

The JSON must exactly match this TypeScript interface:
{
  "Score": number,      // Integer 0-100 reflecting overall fit
  "Verdict": string,    // One of: "Strong Match" | "Moderate Match" | "Weak Match" | "Not a Fit"
  "Feedback": string,   // 2-3 sentences of holistic assessment
  "Pros": string[],     // Array of 3-5 specific strengths with brief explanations
  "Cons": string[]      // Array of 3-5 specific gaps or weaknesses with brief explanations
}

Evaluate with ruthless, real-world recruiter objectivity. Focus on:
- Quantified impact and metrics (numbers, percentages, scale)
- Technology stack alignment
- Seniority and scope match
- Communication clarity and professionalism`;

export async function runAIRecruiter(
  resumeText: string,
  jobDescription: string
): Promise<AIRecruiterResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const userPrompt = `
RESUME:
---
${resumeText.slice(0, 4000)}
---

JOB DESCRIPTION:
---
${jobDescription.slice(0, 3000)}
---

Return ONLY the JSON object. No other text.`;

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: userPrompt },
  ]);

  const raw = result.response.text().trim();
  
  // Strip any accidental markdown fences
  const clean = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  
  const parsed: AIRecruiterResult = JSON.parse(clean);
  
  // Validate required fields
  if (
    typeof parsed.Score !== "number" ||
    !parsed.Verdict ||
    !parsed.Feedback ||
    !Array.isArray(parsed.Pros) ||
    !Array.isArray(parsed.Cons)
  ) {
    throw new Error("Gemini returned malformed JSON — missing required fields.");
  }

  return parsed;
}