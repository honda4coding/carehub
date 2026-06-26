import React from "react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onReset?: () => void;
  minStartDate?: string;
  minEndDate?: string;
  className?: string;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  minStartDate,
  minEndDate,
  className,
}: DateRangeFilterProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto ${className || ''}`}>
      <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
        <input
          type="date"
          value={startDate}
          min={minStartDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
          className="text-sm font-semibold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary flex-1 w-full min-w-0 cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
        />
        <span className="text-base text-[hsl(var(--color-text-muted))]">to</span>
        <input
          type="date"
          value={endDate}
          min={minEndDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
          className="text-sm font-semibold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary flex-1 w-full min-w-0 cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
        />
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="w-full sm:w-auto text-sm font-bold text-[hsl(var(--color-danger))] px-3 py-1.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-md hover:opacity-80 hover:bg-[hsl(var(--color-danger)/0.15)] transition-all whitespace-nowrap cursor-pointer"
        >
          Reset
        </button>
      )}
    </div>
  );
}
