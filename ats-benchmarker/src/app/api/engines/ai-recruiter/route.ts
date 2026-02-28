import { NextRequest, NextResponse } from "next/server";
import { runAIRecruiter } from "@/lib/engines/ai-recruiter";
import type { AIRecruiterRequest, AIRecruiterResponse, APIError } from "@/types/evaluation";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(
  request: NextRequest
): Promise<NextResponse<AIRecruiterResponse | APIError>> {
  try {
    if (!process.env.GEMINI_API_KEY)
      return NextResponse.json({ error: "AI Recruiter not configured. Missing GEMINI_API_KEY." }, { status: 503 });

    const { resumeText, jobDescription }: AIRecruiterRequest = await request.json();

    if (!resumeText || resumeText.trim().length < 50)
      return NextResponse.json({ error: "resumeText must be at least 50 characters." }, { status: 400 });

    if (!jobDescription || jobDescription.trim().length < 50)
      return NextResponse.json({ error: "jobDescription must be at least 50 characters." }, { status: 400 });

    return NextResponse.json(await runAIRecruiter(resumeText.trim(), jobDescription.trim()));
  } catch (err) {
    console.error("[engine/ai-recruiter]", err);
    const msg = err instanceof Error ? err.message : "Unknown";
    const isRate = msg.toLowerCase().includes("rate") || msg.includes("429") || msg.includes("exhausted");
    return NextResponse.json(
      { error: isRate ? "Gemini rate limit reached." : "AI Recruiter failed.", detail: msg },
      { status: isRate ? 429 : 500 }
    );
  }
}