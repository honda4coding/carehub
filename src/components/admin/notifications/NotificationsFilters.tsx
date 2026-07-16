import React from "react";
import { LuSearch, LuCheckCheck } from "react-icons/lu";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
      <div className="w-full flex-1 order-1">
        <Input
          size="sm"
          type="text"
          placeholder="Search notifications..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          leftIcon={<LuSearch />}
          className="w-full !bg-[hsl(var(--color-bg-soft))] focus:!bg-[hsl(var(--color-bg-surface))] text-sm font-medium"
        />
      </div>

      <div className="w-full lg:w-auto shrink-0 order-2">
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:justify-end">
          <div className="grid grid-cols-3 sm:flex sm:flex-row items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full lg:w-auto flex-1 lg:flex-none">
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
                  className={`flex items-center justify-center gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-[8px] text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                      : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-black px-1 sm:px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
                          : "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-muted))]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              icon={LuCheckCheck}
              className="!text-[12px] !font-bold !px-3 !py-1.5 !h-auto !rounded-[8px] shadow-sm shrink-0 cursor-pointer"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
