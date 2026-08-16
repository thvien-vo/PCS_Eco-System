'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, User, Globe, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useProfileStore } from '@/store/profile-store';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

const ROW_VARIANTS = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_TOKENS.durations.base,
      delay: i * 0.06,
      ease: MOTION_TOKENS.easing.enter,
    },
  }),
};

interface SettingsRowProps {
  href: string;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  index: number;
  iconBg?: string;
  iconColor?: string;
}

function SettingsRow({
  href,
  icon: Icon,
  label,
  sublabel,
  index,
  iconBg = 'bg-[var(--primary-emerald)]/10',
  iconColor = 'text-[var(--primary-emerald)]',
}: SettingsRowProps) {
  return (
    <motion.div
      custom={index}
      variants={ROW_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      <Link
        href={href}
        className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-card transition-colors active:bg-muted/60"
      >
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {sublabel && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sublabel}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
      </Link>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { profile } = useProfileStore();
  const hasMounted = useHasMounted();

  const avatarSeed = hasMounted ? encodeURIComponent(profile.name || 'default') : 'default';

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 pb-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.enter }}
        className="pt-2"
      >
        <h1 className="text-xl font-bold text-foreground">{t.settings.title}</h1>
        <p className="text-xs text-muted-foreground">{t.settings.subtitle}</p>
      </motion.div>

      {/* ── Profile preview ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_TOKENS.durations.base, delay: 0.05, ease: MOTION_TOKENS.easing.enter }}
        className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[var(--primary-emerald)]/8 to-[var(--neon-mint)]/5 border border-[var(--primary-emerald)]/15 px-4 py-3.5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${avatarSeed}/200/200`}
          alt="avatar"
          className="h-12 w-12 rounded-full object-cover border-2 border-[var(--primary-emerald)]/30"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {hasMounted ? profile.name : '—'}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {hasMounted ? profile.email : '—'}
          </p>
        </div>
        <Link
          href="/settings/personal-info"
          className="flex-shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-[var(--primary-emerald)] hover:text-[var(--primary-emerald)]"
        >
          {t.settings.rows.personalInfo}
        </Link>
      </motion.div>

      {/* ── Section: Tài khoản ── */}
      <div className="space-y-2">
        <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t.settings.sections.account}
        </p>
        <SettingsRow
          href="/settings/personal-info"
          icon={User}
          label={t.settings.rows.personalInfo}
          sublabel={hasMounted ? profile.name : undefined}
          index={0}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
      </div>

      {/* ── Section: Ứng dụng ── */}
      <div className="space-y-2">
        <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t.settings.sections.app}
        </p>
        <SettingsRow
          href="/settings/language"
          icon={Globe}
          label={t.settings.rows.language}
          index={1}
          iconBg="bg-[var(--primary-emerald)]/10"
          iconColor="text-[var(--primary-emerald)]"
        />
      </div>

      {/* ── Section: Hỗ trợ ── */}
      <div className="space-y-2">
        <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t.settings.sections.support}
        </p>
        <SettingsRow
          href="/settings/contact"
          icon={MessageSquare}
          label={t.settings.rows.contactAdmin}
          index={2}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
        />
      </div>
    </div>
  );
}
