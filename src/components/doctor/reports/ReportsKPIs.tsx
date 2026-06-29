import React from "react";
import { LuBanknote, LuUsers, LuTrendingUp } from "react-icons/lu";
import { useTranslations } from "next-intl";

interface KPIs {
  totalRevenue: number;
  revenueGrowth: number;
  totalVisits: number;
  visitsGrowth: number;
  onlineVisits: number;
  walkinVisits: number;
}

interface ReportsKPIsProps {
  kpis?: KPIs;
}

export default function ReportsKPIs({ kpis }: ReportsKPIsProps) {
  const t = useTranslations("doctor.reports");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue */}
      <div className="bg-[hsl(var(--color-bg-surface))] p-5 rounded-2xl border border-[hsl(var(--color-border))] relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 end-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <LuBanknote className="text-6xl text-[hsl(var(--color-success))]" />
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">
          {t("totalRevenue")}
        </p>
        <h3 className="text-3xl font-black text-[hsl(var(--color-text))] leading-none">
          {t('egp')}{kpis?.totalRevenue?.toLocaleString() || 0}
        </h3>
      </div>

      {/* Total Visits */}
      <div className="bg-[hsl(var(--color-bg-surface))] p-5 rounded-2xl border border-[hsl(var(--color-border))] relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 end-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <LuUsers className="text-6xl text-[hsl(var(--color-primary))]" />
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">
          {t("totalVisits")}
        </p>
        <h3 className="text-3xl font-black text-[hsl(var(--color-text))] leading-none">
          {kpis?.totalVisits || 0}
        </h3>
      </div>

      {/* Visit Distribution */}
      <div className="bg-[hsl(var(--color-bg-surface))] p-5 rounded-2xl border border-[hsl(var(--color-border))] sm:col-span-2 flex flex-col justify-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-3.5">
          {t("visitDistribution")}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs font-extrabold text-[hsl(var(--color-primary))] flex items-center gap-1">
                <LuTrendingUp /> {t("online")}
              </span>
              <span className="text-base font-black text-[hsl(var(--color-text))]">
                {kpis?.onlineVisits || 0}
              </span>
            </div>
            <div className="h-2.5 w-full bg-[hsl(var(--color-primary)/0.1)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--color-primary))] rounded-full"
                style={{
                  width: `${
                    ((kpis?.onlineVisits || 0) /
                      Math.max(1, kpis?.totalVisits || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs font-extrabold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                <LuUsers className="opacity-80" /> {t("walkIn")}
              </span>
              <span className="text-base font-black text-[hsl(var(--color-text))]">
                {kpis?.walkinVisits || 0}
              </span>
            </div>
            <div className="h-2.5 w-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--color-text-muted))] rounded-full"
                style={{
                  width: `${
                    ((kpis?.walkinVisits || 0) /
                      Math.max(1, kpis?.totalVisits || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
