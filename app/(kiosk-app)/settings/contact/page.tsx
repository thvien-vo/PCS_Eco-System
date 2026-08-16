'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { ContactAdminPayload } from '@/types/settings';
import { cn } from '@/lib/utils';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const hasMounted = useHasMounted();

  const [form, setForm] = useState<ContactAdminPayload>({
    subject: '',
    replyEmail: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactAdminPayload, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!hasMounted) {
    return (
      <div className="flex min-h-full flex-col gap-4 p-4 animate-pulse">
        <div className="h-10 w-40 bg-muted rounded-xl" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 w-full bg-muted rounded-2xl" />
        ))}
        <div className="h-24 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  const validate = () => {
    const v = t.settings.contact.validation;
    const e: Partial<Record<keyof ContactAdminPayload, string>> = {};
    if (!form.subject.trim()) e.subject = v.required;
    if (!form.replyEmail.trim()) {
      e.replyEmail = v.required;
    } else if (!EMAIL_RE.test(form.replyEmail)) {
      e.replyEmail = v.invalidEmail;
    }
    if (!form.message.trim()) e.message = v.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setForm({ subject: '', replyEmail: '', message: '' });
      setErrors({});
      setTimeout(() => setShowToast(false), 3200);
    }, 900);
  };

  const c = t.settings.contact;

  const fieldClass = (err?: string) =>
    cn(
      'w-full rounded-2xl border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 shadow-card',
      err
        ? 'border-[var(--error-rose)] focus:ring-[var(--error-rose)]'
        : 'border-border focus:border-[var(--primary-emerald)] focus:ring-[var(--primary-emerald)]'
    );

  return (
    <div className="flex min-h-full flex-col gap-4 p-4 pb-8">
      {/* Back header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base font-bold text-foreground">{c.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {c.subjectLabel}
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => {
              setForm((f) => ({ ...f, subject: e.target.value }));
              if (errors.subject) setErrors((er) => ({ ...er, subject: undefined }));
            }}
            placeholder={c.subjectPlaceholder}
            className={fieldClass(errors.subject)}
          />
          {errors.subject && (
            <p className="px-1 text-[10px] text-[var(--error-rose)]">{errors.subject}</p>
          )}
        </div>

        {/* Reply email */}
        <div className="space-y-1.5">
          <label className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {c.replyEmailLabel}
          </label>
          <input
            type="email"
            value={form.replyEmail}
            onChange={(e) => {
              setForm((f) => ({ ...f, replyEmail: e.target.value }));
              if (errors.replyEmail) setErrors((er) => ({ ...er, replyEmail: undefined }));
            }}
            placeholder={c.replyEmailPlaceholder}
            className={fieldClass(errors.replyEmail)}
          />
          {errors.replyEmail && (
            <p className="px-1 text-[10px] text-[var(--error-rose)]">{errors.replyEmail}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {c.messageLabel}
          </label>
          <textarea
            value={form.message}
            onChange={(e) => {
              setForm((f) => ({ ...f, message: e.target.value }));
              if (errors.message) setErrors((er) => ({ ...er, message: undefined }));
            }}
            placeholder={c.messagePlaceholder}
            rows={4}
            className={cn(fieldClass(errors.message), 'resize-none')}
          />
          {errors.message && (
            <p className="px-1 text-[10px] text-[var(--error-rose)]">{errors.message}</p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary-emerald)] py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--emerald-hover)] disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              {c.submitButton}
              <Send className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Success toast (floating) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: MOTION_TOKENS.durations.base }}
            className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl bg-[var(--primary-emerald)] p-4 text-white shadow-lg"
          >
            <p className="text-sm font-bold">{c.successToast.title}</p>
            <p className="mt-0.5 text-xs opacity-90">{c.successToast.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
