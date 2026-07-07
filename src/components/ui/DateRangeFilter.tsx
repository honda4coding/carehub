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
  stacked?: boolean;
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
  stacked = false,
}: DateRangeFilterProps) {
  return (
    <div className={`flex ${stacked ? 'flex-col items-stretch' : 'flex-wrap items-center'} gap-2 w-full ${className || ''}`}>
      <div className={`flex ${stacked ? 'flex-col items-stretch' : 'flex-wrap items-center'} gap-2 flex-1 min-w-0`}>
        <input
          type="date"
          value={startDate}
          min={minStartDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
          className="flex-1 min-w-0 text-sm font-semibold text-[hsl(var(--color-text))] !bg-[hsl(var(--color-bg-soft))] focus:!bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors w-full"
        />
        {!stacked && <span className="text-base text-[hsl(var(--color-text-muted))]">to</span>}
        <input
          type="date"
          value={endDate}
          min={minEndDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
          className="flex-1 min-w-0 text-sm font-semibold text-[hsl(var(--color-text))] !bg-[hsl(var(--color-bg-soft))] focus:!bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors w-full"
        />
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="w-auto text-sm font-bold text-[hsl(var(--color-danger))] px-3 py-1.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-md hover:opacity-80 hover:bg-[hsl(var(--color-danger)/0.15)] transition-all whitespace-nowrap cursor-pointer"
        >
          Reset
        </button>
      )}
    </div>
  );
}
