import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { Leaf } from 'lucide-react';
import { dictionaries } from '@/lib/i18n/dictionaries';

/**
 * Auth Page — Server Component
 *
 * Route: /auth  (inside the (full-width) layout group)
 *
 * Reads the current Supabase session server-side:
 *   - If the user is already logged in, redirect to home immediately
 *     so they never see the auth form unnecessarily.
 *   - If not logged in, render the AuthForm client component.
 *
 * No middleware redirects are needed — all logic is contained here.
 */
export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already authenticated — send them home.
  if (user) {
    redirect('/');
  }

  // Use VI as default for the page-level static metadata (consistent with app default).
  const t = dictionaries.vi;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-light px-4 py-12 dark:bg-bg-dark">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 shadow-lg">
            <Leaf size={28} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            PCS Eco-System
          </h1>
          <p className="mt-1 text-sm text-text-muted">{t.auth.page.subtitle}</p>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-border-light bg-white p-6 shadow-sm dark:border-border-dark dark:bg-card-dark">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
