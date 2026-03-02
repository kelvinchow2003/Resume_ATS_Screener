// src/app/api/parse-pdf/route.ts
//
// Install first:
//   npm uninstall pdf-parse @types/pdf-parse
//   npm install pdfjs-dist

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
      return NextResponse.json(
        { error: "No file provided. Send a PDF as `file` in form-data." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are accepted." },
        { status: 415 }
      );
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.` },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url
    ).toString();

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      disableWorker: true, 
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pageTexts.push(pageText);
    }

    const text = pageTexts.join("\n\n").replace(/\s+/g, " ").trim();

    if (text.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from this PDF. " +
            "It may be image-based (scanned) or password-protected. " +
            "Please use a standard text-based PDF.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, charCount: text.length, pageCount: numPages });
  } catch (err) {
    console.error("[parse-pdf] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to parse PDF.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}