import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client — for use in Client Components only.
 * Session is managed via cookies (set by the server-side middleware),
 * so Server Components and Client Components always see the same auth state.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
