'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Globe } from 'lucide-react';
import { useLocaleStore, Locale } from '@/store/locale-store';
import { useTranslation } from '@/hooks/use-translation';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { cn } from '@/lib/utils';

export default function LanguagePage() {
  const router = useRouter();
  const { locale, setLocale } = useLocaleStore();
  const { t } = useTranslation();
  const hasMounted = useHasMounted();

  const options: { value: Locale; nativeLabel: string; flag: string }[] = [
    { value: 'vi', nativeLabel: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', nativeLabel: 'English', flag: '🇬🇧' },
  ];

  if (!hasMounted) {
    return (
      <div className="flex min-h-full flex-col gap-4 p-4 animate-pulse">
        <div className="h-10 w-40 bg-muted rounded-xl" />
        {[0, 1].map((i) => (
          <div key={i} className="h-16 w-full bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

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
        <h1 className="text-base font-bold text-foreground">{t.settings.language.title}</h1>
      </div>

      {/* Language options */}
      <div className="space-y-2">
        {options.map((option) => {
          const isActive = locale === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setLocale(option.value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 shadow-card text-left transition-colors',
                isActive
                  ? 'bg-[var(--primary-emerald)]/8 border border-[var(--primary-emerald)]/30'
                  : 'bg-card border border-transparent hover:bg-muted/40'
              )}
            >
              <span className="text-2xl leading-none">{option.flag}</span>
              <div className="flex-1">
                <p className={cn('text-sm font-medium', isActive ? 'text-[var(--primary-emerald)]' : 'text-foreground')}>
                  {option.nativeLabel}
                </p>
              </div>
              {isActive && <Check className="h-4 w-4 flex-shrink-0 text-[var(--primary-emerald)]" />}
            </button>
          );
        })}
      </div>

      {/* Phase 1 note */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-blue-500/8 border border-blue-500/20 px-4 py-3.5">
        <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
        <p className="text-[11px] leading-relaxed text-blue-600 dark:text-blue-400">
          {t.settings.language.note}
        </p>
      </div>
    </div>
  );
}
