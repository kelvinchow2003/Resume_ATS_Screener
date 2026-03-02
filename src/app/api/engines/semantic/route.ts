import { NextRequest, NextResponse } from "next/server";
import { runSemanticATS } from "@/lib/engines/semantic";
import type { SemanticEngineRequest, SemanticEngineResponse, APIError } from "@/types/evaluation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  request: NextRequest
): Promise<NextResponse<SemanticEngineResponse | APIError>> {
  try {
    if (!process.env.COHERE_API_KEY)
      return NextResponse.json({ error: "Semantic engine not configured. Missing COHERE_API_KEY." }, { status: 503 });

    const { resumeText, jobDescription }: SemanticEngineRequest = await request.json();

    if (!resumeText || resumeText.trim().length < 50)
      return NextResponse.json({ error: "resumeText must be at least 50 characters." }, { status: 400 });

    if (!jobDescription || jobDescription.trim().length < 50)
      return NextResponse.json({ error: "jobDescription must be at least 50 characters." }, { status: 400 });

    return NextResponse.json(await runSemanticATS(resumeText.trim(), jobDescription.trim()));
  } catch (err) {
    console.error("[engine/semantic]", err);
    const msg = err instanceof Error ? err.message : "Unknown";
    const isRate = msg.toLowerCase().includes("rate") || msg.includes("429");
    return NextResponse.json(
      { error: isRate ? "Cohere rate limit reached." : "Semantic engine failed.", detail: msg },
      { status: isRate ? 429 : 500 }
    );
  }
}