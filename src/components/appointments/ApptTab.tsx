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
      className={`relative w-full sm:w-auto flex-auto sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 rounded-[12px] text-[13px] font-bold transition-all duration-300 flex items-center justify-between sm:justify-center gap-2 cursor-pointer overflow-hidden ${
        isActive
          ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm"
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-black/5"
      }`}
    >
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
