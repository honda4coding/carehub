"use client";
import { LuDownload, LuFileText, LuPrinter, LuActivity } from "react-icons/lu";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useTranslations } from "next-intl";

export default function QuickActions() {
  const t = useTranslations("patient.QuickActions");
  return (
    <div>
      <h2 className="text-sm font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-3">
        {t("title")}
      </h2>
      <Card className="p-4 flex flex-col gap-3">
        <Link href="/patient/doctors" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-3 text-start cursor-pointer group">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center text-lg">
            <LuFileText />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
              {t("bookAppointment")}
            </p>
            <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">{t("bookDesc")}</p>
          </div>
        </Link>

        <Link href="/patient/record/print" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-3 text-start cursor-pointer group">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] flex items-center justify-center text-lg">
            <LuPrinter />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary-strong))] transition-colors">
              {t("printRecord")}
            </p>
            <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">
              {t("printDesc")}
            </p>
          </div>
        </Link>
      </Card>
    </div>
  );
}
