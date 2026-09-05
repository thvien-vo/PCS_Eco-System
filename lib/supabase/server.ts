import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client — for use in Server Components, Server Actions,
 * and Route Handlers. Session is managed via cookies so it stays in sync with
 * the browser client automatically.
 *
 * Must be called inside an async context where `cookies()` is available.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll() called from a Server Component — cookies can only be
            // mutated from Server Actions or Route Handlers. The middleware
            // handles the actual token refresh, so this is safe to swallow.
          }
        },
      },
    },
  );
}
