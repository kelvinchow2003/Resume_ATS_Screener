// =============================================================================
// src/app/api/debug-pdf/route.ts
// TEMPORARY DEBUG ROUTE — delete after diagnosing the pdf-parse issue.
// Visit: http://localhost:3000/api/debug-pdf in your browser.
// =============================================================================

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test 1: Can we require the lib path?
  try {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js"); // eslint-disable-line
    results["lib_path_require"] = typeof pdfParse;
  } catch (e) {
    results["lib_path_require"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 2: Can we require the main package?
  try {
    const pdfParse = require("pdf-parse"); // eslint-disable-line
    results["main_require"] = typeof pdfParse;
  } catch (e) {
    results["main_require"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 3: Can we dynamic import?
  try {
    const mod = await import("pdf-parse");
    results["dynamic_import_keys"] = Object.keys(mod);
    results["dynamic_import_default_type"] = typeof mod.default;
  } catch (e) {
    results["dynamic_import"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 4: Check Node.js version and runtime
  results["node_version"] = process.version;
  results["platform"] = process.platform;
  results["env_keys"] = Object.keys(process.env).filter(k =>
    ["NODE_ENV", "NEXT_RUNTIME"].includes(k)
  );

  // Test 5: Try parsing a minimal valid PDF buffer
  try {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js"); // eslint-disable-line
    // Minimal 1-page PDF with the text "Hello"
    const minimalPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj " +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj " +
      "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj " +
      "4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj " +
      "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj " +
      "xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n" +
      "0000000115 00000 n\n0000000266 00000 n\n0000000360 00000 n\n" +
      "trailer<</Size 6/Root 1 0 R>>\nstartxref\n441\n%%EOF"
    );
    const parsed = await pdfParse(minimalPdf);
    results["parse_test"] = `OK — extracted ${parsed.text.length} chars, ${parsed.numpages} pages`;
  } catch (e) {
    results["parse_test"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(results, { status: 200 });
}