import React from "react";
import { LuTrendingUp, LuActivity, LuCalendarDays, LuRotateCcw, LuDownload } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface ReportsHeaderProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  onExport: () => void;
}

export default function ReportsHeader({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExport,
}: ReportsHeaderProps) {
    const t = useTranslations("auto");
  return (
    <header className="no-print bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center text-2xl shrink-0">
          <LuTrendingUp />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] tracking-tight">
            {t('reportsAnalytics')}</h1>
          <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
            <LuActivity className="text-[hsl(var(--color-primary))]" /> {t('clinicPerformanceOverview')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        {/* Date Range Picker */}
        <div className="flex items-center bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[hsl(var(--color-primary)/0.15)] focus-within:border-[hsl(var(--color-primary)/0.5)] transition-all flex-1 sm:flex-none">
          <div className="flex items-center px-3 py-2 bg-[hsl(var(--color-bg-soft))] border-e border-[hsl(var(--color-border))]">
            <LuCalendarDays className="text-[hsl(var(--color-primary))] text-lg shrink-0" />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-2.5 py-2 w-[125px] sm:w-[135px] hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
          />
          <div className="flex items-center px-2 text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] border-x border-[hsl(var(--color-border))] h-full">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-85">
              {t('to_6th3')}</span>
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-2.5 py-2 w-[125px] sm:w-[135px] hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {(startDate || endDate) && (
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              icon={LuRotateCcw}
              className="!px-3.5 !py-2 !h-[42px] !rounded-xl !text-[hsl(var(--color-text-muted))] hover:!text-[hsl(var(--color-danger))]"
              title={t('resetFilters')}
            />
          )}
          <Button
            onClick={onExport}
            icon={LuDownload}
            className="!px-5 !py-2 !h-[42px] !rounded-xl !text-[13px] !bg-[hsl(var(--color-primary)/0.1)] !text-[hsl(var(--color-primary))] hover:!bg-[hsl(var(--color-primary))] hover:!text-white border border-transparent hover:border-transparent shrink-0"
          >
            {t('export')}</Button>
        </div>
      </div>
    </header>
  );
}
