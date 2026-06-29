import React from "react";
import { LuSearch, LuCheckCheck } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export const TABS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
] as const;

export type TabValue = (typeof TABS)[number]["value"];

interface NotificationsFiltersProps {
  filter: string;
  setFilter: (val: string) => void;
  activeTab: TabValue;
  setActiveTab: (val: TabValue) => void;
  totalCount: number;
  readCount: number;
  unreadCount: number;
  handleMarkAllAsRead: () => void;
}

export default function NotificationsFilters({
  filter,
  setFilter,
  activeTab,
  setActiveTab,
  totalCount,
  readCount,
  unreadCount,
  handleMarkAllAsRead,
}: NotificationsFiltersProps) {
    const t = useTranslations("auto");
  return (
    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
        <div className="relative flex items-center w-full max-w-[300px]">
          <LuSearch className="absolute start-3 text-[14px] text-[hsl(var(--color-text-muted))]" />
          <input
            type="text"
            placeholder={t('searchNotifications')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="ps-8 pe-3 py-1.5 text-[13px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto shrink-0">
        <div className="flex items-center gap-1 flex-wrap bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full sm:w-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count =
              tab.value === "all"
                ? totalCount
                : tab.value === "read"
                ? readCount
                : unreadCount;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                    : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
                      : "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-muted))]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            icon={LuCheckCheck}
            className="!text-[12px] !font-bold !px-3 !py-1.5 !h-auto !rounded-[8px] shadow-sm flex-1 sm:flex-none cursor-pointer"
          >
            {t('markAllRead')}</Button>
        )}
      </div>
    </div>
  );
}
