"use client";

import { LuCheckCheck, LuSearch } from "react-icons/lu";
import { TABS, TabValue } from "./types";
import { Button } from "@/components/ui/Button";

interface Props {
  activeTab: TabValue;
  setActiveTab: (val: TabValue) => void;
  filter: string;
  setFilter: (val: string) => void;
  unreadCount: number;
  handleMarkAllAsRead: () => void;
}

export default function NotificationFilters({
  activeTab,
  setActiveTab,
  filter,
  setFilter,
  unreadCount,
  handleMarkAllAsRead,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex gap-1 flex-wrap w-full sm:w-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-[8px] transition-all flex-1 sm:flex-none cursor-pointer ${
              activeTab === tab.value
                ? "bg-[hsl(var(--color-primary))] text-white"
                : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto mt-2 sm:mt-0">
        {unreadCount > 0 && (
          <Button
            size="sm"
            onClick={handleMarkAllAsRead}
            icon={LuCheckCheck}
            className="text-[11px] px-3 py-1.5 flex-1 sm:flex-none whitespace-nowrap min-h-0 h-auto"
          >
            Mark All Read
          </Button>
        )}

        <div className="relative flex items-center flex-1 sm:flex-none">
          <LuSearch className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))]" />

          <input
            type="text"
            placeholder="Search notifications..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-[11px] font-medium rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full sm:w-[220px] outline-none transition-colors focus:border-[hsl(var(--color-primary)/0.5)]"
          />
        </div>
      </div>
    </div>
  );
}
