import React from "react";
import { LuSearch } from "react-icons/lu";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export const TABS: { label: string; value: ApprovalStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

interface ApprovalsFiltersProps {
  activeTab: ApprovalStatus | "all";
  setActiveTab: (val: ApprovalStatus | "all") => void;
  filter: string;
  setFilter: (val: string) => void;
  totalDoctors: number;
  tabCounts: Record<string, number>;
}

export default function ApprovalsFilters({
  activeTab,
  setActiveTab,
  filter,
  setFilter,
  totalDoctors,
  tabCounts,
}: ApprovalsFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
        {/* Status tabs */}
        <div className="flex items-center gap-1 flex-wrap bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full sm:w-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = tab.value === "all" ? totalDoctors : tabCounts[tab.value] ?? 0;
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
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto shrink-0">
        <div className="relative flex items-center w-full sm:w-[250px]">
          <LuSearch className="absolute left-3 text-[14px] text-[hsl(var(--color-text-muted))]" />
          <input
            type="text"
            placeholder="Filter by name or specialty..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[13px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-text"
          />
        </div>
      </div>
    </div>
  );
}
