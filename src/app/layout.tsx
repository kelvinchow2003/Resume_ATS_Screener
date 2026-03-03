// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ATS Benchmarker — Score your resume against 3 ATS engines",
  description:
    "Upload your resume and a job description to get scored by a Legacy keyword ATS, a Semantic embedding ATS, and an AI Recruiter powered by Gemini.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <Header initialUser={user} />
        {children}
      </body>
    </html>
  );
}