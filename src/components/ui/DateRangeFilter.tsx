import React from "react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onReset: () => void;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="text-[11px] font-semibold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary flex-1 sm:w-auto sm:min-w-[120px] cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
        />
        <span className="text-[12px] text-[hsl(var(--color-text-muted))]">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="text-[11px] font-semibold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary flex-1 sm:w-auto sm:min-w-[120px] cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
        />
      </div>
      <button
        onClick={onReset}
        className="w-full sm:w-auto text-[11px] font-bold text-[hsl(var(--color-danger))] px-3 py-1.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-md hover:opacity-80 hover:bg-[hsl(var(--color-danger)/0.15)] transition-all whitespace-nowrap cursor-pointer"
      >
        Reset
      </button>
    </div>
  );
}
