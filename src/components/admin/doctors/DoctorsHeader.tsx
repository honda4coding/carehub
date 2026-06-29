import React from "react";
import { LuStethoscope, LuRefreshCw } from "react-icons/lu";

interface DoctorsHeaderProps {
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function DoctorsHeader({
  totalCount,
  isLoading,
  error,
  onRefresh,
}: DoctorsHeaderProps) {
  return (
    <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight ps-11 md:pl-0">
            Doctor Directory
          </h1>
          <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 ps-11 md:pl-0">
            View all registered doctors and their approval status
          </p>
        </div>

        {/* Stat strip inside header */}
        {!isLoading && !error && (
          <div className="hidden md:flex items-center gap-2 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-1.5 shadow-sm ms-4">
            <LuStethoscope className="text-[14px] text-[hsl(var(--color-primary))]" />
            <span className="text-[13px] font-black text-[hsl(var(--color-text))]">
              {totalCount}
            </span>
            <span className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
              total doctors
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
          className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-all disabled:opacity-50 cursor-pointer"
        >
          <LuRefreshCw className={`text-[14px] ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}
