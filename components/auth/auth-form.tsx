'use client';

import { useActionState, useState, useEffect } from 'react';
import { signIn, signUp, type AuthActionState } from '@/app/actions/auth-actions';
import { useTranslation } from '@/hooks/use-translation';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { motionTokens } from '@/lib/motion-tokens';
import { MergeDataPrompt } from '@/components/auth/merge-data-prompt';
import { useAuth } from '@/components/shared/auth-provider';

type Tab = 'login' | 'signup';

/**
 * AuthForm
 *
 * Bilingual login/signup form for the /auth page.
 * Uses React useActionState wired to Supabase Server Actions.
 * All strings are sourced from dictionaries.ts via useTranslation().
 * Shows the MergeDataPrompt after a successful login/signup.
 */
export function AuthForm() {
  const t = useTranslation();
  const hasMounted = useHasMounted();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [showMergePrompt, setShowMergePrompt] = useState(false);

  const [loginState, loginAction, loginPending] = useActionState<
    AuthActionState,
    FormData
  >(signIn, {});

  const [signupState, signupAction, signupPending] = useActionState<
    AuthActionState,
    FormData
  >(signUp, {});

  const isPending = loginPending || signupPending;
  const currentState = tab === 'login' ? loginState : signupState;

  // After a successful auth, offer the data-merge prompt (only for first login).
  useEffect(() => {
    if (user && (loginState?.success || signupState?.success)) {
      const alreadySynced =
        typeof window !== 'undefined' &&
        localStorage.getItem('pcs-is-synced') === 'true';
      if (!alreadySynced) {
        setShowMergePrompt(true);
      }
    }
  }, [user, loginState?.success, signupState?.success]);

  if (!hasMounted) {
    // Skeleton to prevent hydration mismatch
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-full rounded-xl bg-card-light dark:bg-card-dark" />
        <div className="h-10 w-full rounded-xl bg-card-light dark:bg-card-dark" />
        <div className="h-12 w-full rounded-xl bg-card-light dark:bg-card-dark" />
      </div>
    );
  }

  function resolveError(error?: string): string {
    if (!error) return '';
    if (error === 'MISSING_FIELDS') return t.auth.errors.missingFields;
    if (error.toLowerCase().includes('invalid login credentials'))
      return t.auth.errors.invalidCredentials;
    if (
      error.toLowerCase().includes('already registered') ||
      error.toLowerCase().includes('already in use')
    )
      return t.auth.errors.emailInUse;
    return t.auth.errors.generic;
  }

  return (
    <>
      {showMergePrompt && (
        <MergeDataPrompt onDone={() => setShowMergePrompt(false)} />
      )}

      {/* Tab switcher */}
      <div className="mb-6 flex rounded-xl bg-card-light p-1 dark:bg-card-dark">
        {(['login', 'signup'] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              tab === tabKey
                ? 'bg-white text-primary-emerald shadow-sm dark:bg-bg-dark dark:text-neon-mint'
                : 'text-text-muted hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
            aria-pressed={tab === tabKey}
          >
            {tabKey === 'login' ? t.auth.tabs.login : t.auth.tabs.signup}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={tab}
          action={tab === 'login' ? loginAction : signupAction}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: motionTokens.duration.base / 1000, ease: motionTokens.easing.standard }}
          className="space-y-4"
          aria-label={tab === 'login' ? t.auth.tabs.login : t.auth.tabs.signup}
        >
          {/* Name field — signup only */}
          {tab === 'signup' && (
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                name="name"
                type="text"
                placeholder={t.auth.fields.namePlaceholder}
                aria-label={t.auth.fields.name}
                className="w-full rounded-xl border border-border-light bg-white py-3 pl-9 pr-4 text-sm text-text-primary-light transition focus:border-primary-emerald focus:outline-none dark:border-border-dark dark:bg-card-dark dark:text-text-primary-dark"
              />
            </div>
          )}

          {/* Email field */}
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              name="email"
              type="email"
              required
              placeholder={t.auth.fields.emailPlaceholder}
              aria-label={t.auth.fields.email}
              className="w-full rounded-xl border border-border-light bg-white py-3 pl-9 pr-4 text-sm text-text-primary-light transition focus:border-primary-emerald focus:outline-none dark:border-border-dark dark:bg-card-dark dark:text-text-primary-dark"
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder={t.auth.fields.passwordPlaceholder}
              aria-label={t.auth.fields.password}
              className="w-full rounded-xl border border-border-light bg-white py-3 pl-9 pr-4 text-sm text-text-primary-light transition focus:border-primary-emerald focus:outline-none dark:border-border-dark dark:bg-card-dark dark:text-text-primary-dark"
            />
          </div>

          {/* Error message */}
          <AnimatePresence>
            {currentState?.error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-error-rose dark:bg-rose-950/30"
                role="alert"
              >
                {resolveError(currentState.error)}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {currentState?.success && tab === 'signup' && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-primary-emerald dark:bg-emerald-950/30"
                role="status"
              >
                {t.auth.success.signupDone}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-emerald py-3 text-sm font-semibold text-white transition hover:bg-emerald-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                {tab === 'login'
                  ? t.auth.buttons.loggingIn
                  : t.auth.buttons.signingUp}
              </>
            ) : tab === 'login' ? (
              t.auth.buttons.login
            ) : (
              t.auth.buttons.signup
            )}
          </button>
        </motion.form>
      </AnimatePresence>
    </>
  );
}
