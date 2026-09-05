import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Supabase Auth Middleware
 *
 * Responsibilities:
 *   1. Refresh the Supabase auth token on every matched request.
 *   2. Forward the refreshed session cookie to both the request (for Server
 *      Components to read) and the response (for the browser to store).
 *
 * PWA / redirect-loop safety:
 *   The `matcher` below explicitly excludes all static assets, PWA service
 *   workers (sw.js, workbox-*.js), the web manifest, and media files.
 *   Without this, the middleware would run on every asset request, causing
 *   infinite redirect loops on mobile PWA installs.
 *
 * We do NOT perform any redirect logic here — route protection is handled
 * inside individual layouts/pages to keep this middleware lean and avoid
 * redirect loops for anonymous users.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto the request so Server Components can read them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Re-create the response so it carries the updated request cookies.
          supabaseResponse = NextResponse.next({ request });
          // Write cookies onto the response so the browser stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() must be called here to trigger the token refresh.
  // Do not remove this call — without it the session will not be refreshed.
  await supabase.auth.getUser();

  return supabaseResponse;
}

/**
 * Matcher — routes that run the middleware.
 *
 * Excludes:
 *   - _next/static  — Next.js static chunk files
 *   - _next/image   — Image optimisation endpoint
 *   - favicon.ico   — Browser favicon request
 *   - manifest.json — PWA web app manifest
 *   - sw.js         — PWA service worker
 *   - workbox-*.js  — Workbox runtime chunks (emitted by next-pwa)
 *   - Any path ending in a static media/font/data extension
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|json|js|css|map)$).*)',
  ],
};
