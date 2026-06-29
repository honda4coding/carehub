import React from "react";
import { LuChevronLeft } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ApprovalsHeader() {
    const t = useTranslations("auto");
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.push("/admin")}
        className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-all cursor-pointer"
      >
        <LuChevronLeft className="text-[15px]" />
      </button>
      <div>
        <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight">
          {t('doctorApprovals')}</h1>
        <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
          {t('reviewAndManageDoctor')}</p>
      </div>
    </div>
  );
}
