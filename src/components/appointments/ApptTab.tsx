"use client";

export type TabType = "today" | "upcoming" | "completed" | "cancelled";

export default function ApptTab({
  label,
  value,
  active,
  count,
  onClick,
}: {
  label: string;
  value: TabType;
  active: TabType;
  count: number;
  onClick: () => void;
}) {
  const isActive = value === active;
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 sm:flex-none min-w-[110px] sm:min-w-0 px-3 sm:px-6 py-2.5 rounded-[12px] text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 overflow-hidden ${
        isActive
          ? "bg-[hsl(var(--color-primary))] text-white shadow-md shadow-[hsl(var(--color-primary)/0.2)]"
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))]"
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      )}
      <span className="relative z-10">{label}</span>
      <span
        className={`relative z-10 text-[11px] font-black min-w-[22px] px-1.5 py-0.5 rounded-full transition-colors flex items-center justify-center ${
          isActive
            ? "bg-[hsl(var(--color-secondary))] text-white shadow-sm"
            : "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
