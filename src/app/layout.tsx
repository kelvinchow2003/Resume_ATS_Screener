// =============================================================================
// src/app/layout.tsx
// Root layout — wraps every page. Sets fonts, metadata, and imports globals.css.
// Now includes the global Header component for consistent navigation.
// =============================================================================

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "ATS Benchmarker — Score your resume against 3 ATS engines",
  description:
    "Upload your resume and a job description to get scored by a Legacy keyword ATS, a Semantic embedding ATS, and an AI Recruiter powered by Gemini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}