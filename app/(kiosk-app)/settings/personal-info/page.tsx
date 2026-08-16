'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useProfileStore } from '@/store/profile-store';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { cn } from '@/lib/utils';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
const VN_PHONE_RE = /^(0[3|5|7|8|9])[0-9]{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PersonalInfoPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, setProfile } = useProfileStore();
  const hasMounted = useHasMounted();

  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saved, setSaved] = useState(false);

  if (!hasMounted) {
    return (
      <div className="flex min-h-full flex-col gap-4 p-4 animate-pulse">
        <div className="h-10 w-40 bg-muted rounded-xl" />
        <div className="h-28 w-full bg-muted rounded-2xl" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 w-full bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

  const validate = () => {
    const v = t.settings.personalInfo.validation;
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = v.required;
    if (!form.phone.trim()) {
      e.phone = v.required;
    } else if (!VN_PHONE_RE.test(form.phone.trim())) {
      e.phone = v.invalidPhone;
    }
    if (!form.email.trim()) {
      e.email = v.required;
    } else if (!EMAIL_RE.test(form.email.trim())) {
      e.email = v.invalidEmail;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const trimmedName = form.name.trim();
    setProfile({
      name: trimmedName,
      phone: form.phone.trim(),
      email: form.email.trim(),
      avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(trimmedName)}/200/200`,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const pInfo = t.settings.personalInfo;

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
        <h1 className="text-base font-bold text-foreground">{pInfo.title}</h1>
      </div>

      {/* Avatar preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.enter }}
        className="flex flex-col items-center gap-2 py-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${encodeURIComponent(form.name.trim() || 'default')}/200/200`}
          alt="avatar"
          className="h-20 w-20 rounded-full object-cover border-4 border-[var(--primary-emerald)]/30 shadow-md"
        />
        <p className="text-[11px] text-muted-foreground">
          Ảnh đại diện tự động theo tên
        </p>
      </motion.div>

      {/* Form fields */}
      <div className="space-y-3">
        {([
          { key: 'name', label: pInfo.nameLabel, placeholder: pInfo.namePlaceholder, type: 'text' },
          { key: 'phone', label: pInfo.phoneLabel, placeholder: pInfo.phonePlaceholder, type: 'tel' },
          { key: 'email', label: pInfo.emailLabel, placeholder: pInfo.emailPlaceholder, type: 'email' },
        ] as const).map(({ key, label, placeholder, type }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: MOTION_TOKENS.durations.base,
              delay: 0.08 + i * 0.06,
              ease: MOTION_TOKENS.easing.enter,
            }}
            className="rounded-2xl bg-card px-4 py-3.5 shadow-card space-y-1.5"
          >
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => {
                setForm((f) => ({ ...f, [key]: e.target.value }));
                if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
              }}
              placeholder={placeholder}
              className={cn(
                'w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none',
                errors[key] ? 'text-[var(--error-rose)]' : ''
              )}
            />
            {errors[key] && (
              <p className="text-[10px] text-[var(--error-rose)]">{errors[key]}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        whileTap={{ scale: 0.97 }}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary-emerald)] py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--emerald-hover)]"
      >
        {pInfo.saveButton}
      </motion.button>

      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: MOTION_TOKENS.durations.base }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-[var(--primary-emerald)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            <Check className="h-4 w-4" />
            {pInfo.savedToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
