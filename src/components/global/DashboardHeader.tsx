"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LuChevronLeft } from "react-icons/lu";

interface DashboardHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  backPath?: string;
  rightElement?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  backPath,
  rightElement,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3 md:gap-4 z-40 sticky top-0 shrink-0">
      <div className="flex items-center gap-3 md:gap-4 min-w-0 pl-11 md:pl-0 flex-1 md:flex-none">
        {backPath && (
          <button
            onClick={() => router.push(backPath)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-soft hover:bg-primary hover:text-white text-text-muted transition-colors border border-border shrink-0"
          >
            <LuChevronLeft className="text-xl" />
          </button>
        )}
        <div className="min-w-0">
          {typeof title === "string" ? (
            <h1 className="text-[16px] md:text-[18px] font-black text-text truncate">
              {title}
            </h1>
          ) : (
            title
          )}
          {subtitle && (
            <p className="text-[11px] md:text-[12px] font-semibold text-text-muted truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightElement && (
        <div className="flex items-center gap-2 shrink-0 w-auto max-w-full overflow-visible pb-1 md:pb-0">
          {rightElement}
        </div>
      )}
    </header>
  );
}
