// =============================================================================
// src/app/reset-password/page.tsx
// Set new password after clicking the reset link from email.
// =============================================================================

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/evaluate"), 2000);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative bg-[#0b0d14] min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-sm text-slate-500">Choose a strong password for your account.</p>
        </div>

        <div className="bg-[#111420] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Password updated</h3>
              <p className="text-sm text-slate-400">Redirecting you now…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-sm text-red-300 flex gap-2.5">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  New Password
                </label>
                <input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600
                    bg-slate-800/60 border border-slate-700 hover:border-slate-600
                    focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/40
                    transition-all duration-150 outline-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm" className="block text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  Confirm Password
                </label>
                <input
                  id="confirm" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password" disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600
                    bg-slate-800/60 border border-slate-700 hover:border-slate-600
                    focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/40
                    transition-all duration-150 outline-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200
                  shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
