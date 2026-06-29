"use client";
import Link from "next/link";
import { usePathname } from "@/i18n/routing";
import { LuActivity } from "react-icons/lu";
import { useTranslations } from 'next-intl';

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/doctor") || pathname.startsWith("/patient");
  if (isDashboard) return null;

  return (
    <footer className="bg-[hsl(var(--color-bg))] border-t border-[hsl(var(--color-text-muted)/0.1)] mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-center md:text-left">
          
          {/* Brand & Description */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <LuActivity className="w-8 h-8 text-[hsl(var(--color-primary))] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-[hsl(var(--color-text))] tracking-tight">
                {t('navbar.brand')}
              </span>
            </Link>
            <p className="text-[hsl(var(--color-text-muted))] text-xs font-semibold leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-[hsl(var(--color-text))] text-sm font-black uppercase tracking-wider mb-2">{t('footer.quickLinks')}</h4>
            <Link href="/" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">{t('navbar.home')}</Link>
            <Link href="/about" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">{t('navbar.about')}</Link>
            <Link href="/doctors" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">{t('navbar.doctors')}</Link>
          </div>

          {/* Legal & Support */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-[hsl(var(--color-text))] text-sm font-black uppercase tracking-wider mb-2">{t('footer.legalSupport')}</h4>
            <Link href="/privacy" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">{t('footer.privacyPolicy')}</Link>
            <Link href="/terms" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">{t('footer.termsOfService')}</Link>
            <Link href="/support" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">{t('footer.contactSupport')}</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[hsl(var(--color-text-muted)/0.1)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} {t('navbar.brand')} <span className="text-[hsl(var(--color-primary))]">{t('footer.medicalSystems')}</span>.
          </p>
          <p className="text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-widest opacity-80">
            {t('footer.tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}