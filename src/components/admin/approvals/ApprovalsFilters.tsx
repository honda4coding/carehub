import React from "react";
import { LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/Input";

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
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
      <div className="w-full lg:w-auto shrink-0 order-2 lg:order-1">
        {/* Status tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = tab.value === "all" ? totalDoctors : tabCounts[tab.value] ?? 0;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-[8px] text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      <div className="w-full flex-1 order-1 lg:order-2">
        <Input
          size="sm"
          type="text"
          placeholder="Search name, email or specialty…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          leftIcon={<LuSearch />}
          className="w-full !bg-[hsl(var(--color-bg-soft))] focus:!bg-[hsl(var(--color-bg-surface))] text-sm font-medium"
        />
      </div>
    </div>
  );
}
