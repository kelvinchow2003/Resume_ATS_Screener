// =============================================================================
// src/app/api/parse-pdf/route.ts
// POST /api/parse-pdf
// Accepts a multipart/form-data PDF upload, extracts plain text via pdf-parse.
// Node.js runtime required — pdf-parse is not Edge-compatible.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import type { ParsePDFResponse, APIError } from "@/types/evaluation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ParsePDFResponse | APIError>> {
  try {
    // --- 1. Parse multipart form data ---
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Send a PDF as `file` in form-data." },
        { status: 400 }
      );
    }

    // --- 2. Validate MIME type ---
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only PDFs are accepted.` },
        { status: 415 }
      );
    }

    // --- 3. Validate file size (5 MB hard limit) ---
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum is 5 MB.`,
        },
        { status: 413 }
      );
    }

    // --- 4. Convert File → Node Buffer ---
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- 5. Import pdf-parse — handles both CJS (.default) and ESM exports ---
    const pdfParseModule = await import("pdf-parse");
    // pdf-parse may ship as CJS (module.exports = fn) or ESM ({ default: fn })
    const pdfParse =
      typeof pdfParseModule === "function"
        ? pdfParseModule
        : (pdfParseModule as { default?: unknown }).default ?? pdfParseModule;

    if (typeof pdfParse !== "function") {
      throw new Error("pdf-parse did not export a callable function.");
    }

    const parsed = await (pdfParse as (buf: Buffer, opts?: object) => Promise<{
      text: string;
      numpages: number;
    }>)(buffer, {});

    const text = parsed.text?.trim() ?? "";

    if (text.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from this PDF. It may be image-based or encrypted. Try a text-based PDF.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      charCount: text.length,
      pageCount: parsed.numpages,
    });
  } catch (err) {
    console.error("[parse-pdf] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to parse PDF.",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}