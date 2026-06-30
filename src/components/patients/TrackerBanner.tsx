"use client";
import Link from 'next/link';
import { LuActivity, LuChevronRight } from 'react-icons/lu';
import { useTranslations } from "next-intl";

interface Props {
  className?: string;
}

export default function TrackerBanner({ className = "" }: Props) {
  const t = useTranslations("patient.TrackerBanner");
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-strong))] p-6 text-white group flex flex-col justify-center ${className}`}>
      {/* Decorative background blur blobs */}
      <div className="absolute top-0 end-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 end-1/3 w-40 h-40 bg-[hsl(var(--color-primary-soft))] opacity-30 rounded-full blur-3xl translate-y-1/3 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-between gap-3">
        <div className="flex flex-row items-center gap-3 text-start">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <LuActivity className="text-2xl animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black mb-0.5 tracking-tight">{t("title")}</h2>
            <p className="text-xs font-medium text-white/80 max-w-sm">
              {t("desc")}
            </p>
          </div>
        </div>
        
        <Link 
          href="/patient/tracking" 
          className="shrink-0 w-fit px-5 py-2.5 bg-white text-[hsl(var(--color-primary-strong))] font-black text-xs rounded-xl hover:bg-[hsl(var(--color-bg-soft))] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          {t("openTracker")} <LuChevronRight className="text-base transition-transform group-hover:translate-x-1.5" />
        </Link>
      </div>
    </div>
  );
}
