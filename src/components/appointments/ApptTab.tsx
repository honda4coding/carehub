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
      className={`relative flex-1 sm:flex-none min-w-[110px] sm:min-w-0 px-2 sm:px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
        isActive
          ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]"
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))]"
      }`}
    >
      {label}
      <span
        className={`text-[12px] font-black min-w-[22px] px-1.5 py-0.5 rounded-full transition-colors ${
          isActive
            ? "bg-[hsl(var(--color-secondary))] text-white"
            : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
