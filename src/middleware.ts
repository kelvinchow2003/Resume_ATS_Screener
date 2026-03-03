// =============================================================================
// src/middleware.ts
// Next.js middleware — runs on every matched request.
// 1. Refreshes the Supabase session cookie (keeps auth alive)
// 2. Redirects unauthenticated users away from /dashboard, /evaluate, /results
// 3. Redirects authenticated users away from /login and /signup
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Only these exact prefixes require a logged-in user
const PROTECTED_ROUTES = ["/dashboard", "/results"];
// /evaluate is intentionally NOT protected — anonymous use is allowed
const AUTH_ROUTES = ["/login", "/signup"];

// Must be named "middleware" — Next.js looks for this exact export name
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always use getUser() not getSession() — validates JWT server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/evaluate", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/results/:path*",
    "/evaluate/:path*",
    "/login",
    "/signup",
  ],
};