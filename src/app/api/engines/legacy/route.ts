import { NextRequest, NextResponse } from "next/server";
import { runLegacyATS } from "@/lib/engines/legacy";
import type { LegacyEngineRequest, LegacyEngineResponse, APIError } from "@/types/evaluation";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest
): Promise<NextResponse<LegacyEngineResponse | APIError>> {
  try {
    const { resumeText, jobDescription }: LegacyEngineRequest = await request.json();

    if (!resumeText || resumeText.trim().length < 50)
      return NextResponse.json({ error: "resumeText must be at least 50 characters." }, { status: 400 });

    if (!jobDescription || jobDescription.trim().length < 50)
      return NextResponse.json({ error: "jobDescription must be at least 50 characters." }, { status: 400 });

    return NextResponse.json(runLegacyATS(resumeText.trim(), jobDescription.trim()));
  } catch (err) {
    console.error("[engine/legacy]", err);
    return NextResponse.json(
      { error: "Legacy engine failed.", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}