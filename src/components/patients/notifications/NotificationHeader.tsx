"use client";

import { useRouter } from "next/navigation";
import { LuChevronLeft } from "react-icons/lu";
import { useTranslations } from "next-intl";

export default function NotificationHeader() {
    const t = useTranslations("auto");
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.back()}
        className="w-8 h-8 rounded-[9px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors cursor-pointer"
      >
        <LuChevronLeft className="text-[15px]" />
      </button>

      <div>
        <h1 className="text-[17px] font-black text-[hsl(var(--color-text))] tracking-tight">
          {t('notifications')}</h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
          {t('viewAndManageAll')}</p>
      </div>
    </div>
  );
}
