import React from "react";
import { LuUsers, LuRefreshCw } from "react-icons/lu";
import { UsersPagination } from "@/types/user";
import { useTranslations } from "next-intl";

interface UsersHeaderProps {
  pagination: UsersPagination | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function UsersHeader({ pagination, isLoading, onRefresh }: UsersHeaderProps) {
    const t = useTranslations("auto");
  return (
    <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight ps-11 md:pl-0">
            {t('userDirectory')}</h1>
          <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 ps-11 md:pl-0">
            {t('manageAllRegisteredAccounts')}</p>
        </div>

        {/* Stat strip inside header */}
        {pagination && !isLoading && (
          <div className="hidden md:flex items-center gap-2 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-1.5 shadow-sm ms-4">
            <LuUsers className="text-[14px] text-[hsl(var(--color-primary))]" />
            <span className="text-[13px] font-black text-[hsl(var(--color-text))]">
              {pagination.totalCount}
            </span>
            <span className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
              {t('totalUsers')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title={t('refresh')}
          className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <LuRefreshCw className={`text-[14px] ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}
