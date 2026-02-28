// POST /api/parse-pdf
// Accepts multipart/form-data PDF, returns extracted plain text.
// Node.js runtime required — pdf-parse is not Edge-compatible.

import { NextRequest, NextResponse } from "next/server";
import type { ParsePDFResponse, APIError } from "@/types/evaluation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ParsePDFResponse | APIError>> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided. Send a PDF as `file` in form-data." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: `Invalid file type: ${file.type}. Only PDFs accepted.` }, { status: 415 });
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max 5 MB.` }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Dynamic import avoids Edge bundler errors
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer, { version: "default" });

    const text = parsed.text?.trim() ?? "";

    if (text.length < 50) {
      return NextResponse.json({
        error: "Could not extract readable text. The PDF may be image-based or encrypted.",
      }, { status: 422 });
    }

    return NextResponse.json({ text, charCount: text.length, pageCount: parsed.numpages });
  } catch (err) {
    console.error("[parse-pdf]", err);
    return NextResponse.json(
      { error: "Failed to parse PDF.", detail: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}