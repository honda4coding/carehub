'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { LuGlobe } from 'react-icons/lu';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    
    // Reconstruct search params
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    startTransition(() => {
      // @ts-ignore - appending query to pathname
      router.replace(`${pathname}${query}`, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors
        ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]'}`}
      title={locale === 'ar' ? 'Switch to English' : 'تغيير للغة العربية'}
    >
      <LuGlobe className="w-5 h-5 shrink-0" />
      <span className="mt-0.5">{locale === 'ar' ? 'EN' : 'عربي'}</span>
    </button>
  );
}
