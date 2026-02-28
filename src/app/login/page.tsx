// =============================================================================
// src/app/login/page.tsx
// useSearchParams() requires a Suspense boundary in Next.js App Router.
// Pattern: inner component reads search params, outer page wraps with Suspense.
// =============================================================================

"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldError {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

function validateForm(form: FormState, mode: AuthMode): FieldError {
  const errors: FieldError = {};
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Please enter a valid email address.";
  if (!form.password || form.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (mode === "signup" && form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

function InputField({
  id, label, type, value, onChange, error, placeholder, disabled,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; error?: string;
  placeholder?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-400 tracking-wider uppercase">
        {label}
      </label>
      <input
        id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600
          bg-slate-800/60 border transition-all duration-150 outline-none
          disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500/40
          ${error
            ? "border-red-500/60 bg-red-950/10 focus:border-red-500/60"
            : "border-slate-700 hover:border-slate-600 focus:border-blue-500/60"}
        `}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Inner component — contains useSearchParams(), MUST be inside <Suspense>
// -----------------------------------------------------------------------------
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirectedFrom") ?? "/evaluate";

  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirectTarget);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function setField(key: keyof FormState) {
    return (value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setErrors({});
    setSuccessMsg(null);
    setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    const validation = validateForm(form, mode);
    if (Object.keys(validation).length > 0) { setErrors(validation); return; }
    setIsLoading(true);
    setErrors({});
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email, password: form.password,
        });
        if (error) { setErrors({ form: error.message }); return; }
        router.push(redirectTarget);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) { setErrors({ form: error.message }); return; }
        setSuccessMsg("Account created! Check your email for a confirmation link before signing in.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setErrors({ form: error.message }); setIsLoading(false); }
  }

  return (
    <div className="bg-[#111420] border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex bg-slate-900 rounded-xl p-1 mb-8">
        {(["login", "signup"] as const).map((m) => (
          <button key={m} type="button" onClick={() => switchMode(m)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
              ${mode === m ? "bg-[#1a1f35] text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>
            {m === "login" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-sm text-emerald-300 flex gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      {errors.form && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-sm text-red-300 flex gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <InputField id="email" label="Email" type="email" value={form.email}
          onChange={setField("email")} error={errors.email} placeholder="you@example.com" disabled={isLoading} />
        <InputField id="password" label="Password" type="password" value={form.password}
          onChange={setField("password")} error={errors.password}
          placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"} disabled={isLoading} />
        {mode === "signup" && (
          <InputField id="confirmPassword" label="Confirm Password" type="password"
            value={form.confirmPassword} onChange={setField("confirmPassword")}
            error={errors.confirmPassword} placeholder="Re-enter your password" disabled={isLoading} />
        )}
        <button type="submit" disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white
                     bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                     disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200
                     shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {mode === "login" ? "Signing in…" : "Creating account…"}
            </>
          ) : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-600 font-medium">or continue with</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <button type="button" onClick={handleGoogleLogin} disabled={isLoading}
        className="w-full py-3 rounded-xl border border-slate-700 text-sm font-medium text-slate-300
                   hover:border-slate-600 hover:bg-slate-800/50 hover:text-white
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150
                   flex items-center justify-center gap-2.5">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-xs text-slate-500 mt-6">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          {mode === "login" ? "Sign up free" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

// Skeleton shown while LoginForm suspends during static prerender
function LoginSkeleton() {
  return (
    <div className="bg-[#111420] border border-slate-800 rounded-2xl p-8 shadow-2xl animate-pulse">
      <div className="h-10 bg-slate-800 rounded-xl mb-8" />
      <div className="space-y-5">
        <div className="h-16 bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-800 rounded-xl" />
        <div className="h-12 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Page export — Suspense wraps LoginForm which calls useSearchParams()
// -----------------------------------------------------------------------------
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-mono text-lg font-bold text-white tracking-tight">
              ATS<span className="text-blue-400">.</span>Benchmarker
            </span>
          </div>
          <p className="text-sm text-slate-500">Score your resume against 3 real-world ATS engines</p>
        </div>

        {/* Suspense boundary is REQUIRED whenever useSearchParams() is used in App Router */}
        <Suspense fallback={<LoginSkeleton />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-slate-600 mt-6">
          Free to use · No credit card required · Powered by Supabase Auth
        </p>
      </div>
    </div>
  );
}