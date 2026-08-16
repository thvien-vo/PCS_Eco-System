import { useLocaleStore } from '@/store/locale-store';
import { dictionaries, TranslationDictionary } from '@/lib/i18n/dictionaries';

export function useTranslation(): { t: TranslationDictionary, locale: 'vi' | 'en' } {
  const locale = useLocaleStore((state) => state.locale);
  const t = dictionaries[locale] || dictionaries.vi;

  return { t, locale };
}
