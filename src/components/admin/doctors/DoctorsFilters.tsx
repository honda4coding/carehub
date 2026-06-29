import React from "react";
import { LuSearch, LuFilter } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { DoctorApprovalStatus } from "@/types/doctor";

export const STATUS_TABS: { label: string; value: DoctorApprovalStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

interface DoctorsFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: DoctorApprovalStatus | "";
  setStatusFilter: (val: DoctorApprovalStatus | "") => void;
  isLoading: boolean;
  totalDoctors: number;
  tabCounts: Record<string, number>;
}

export default function DoctorsFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  isLoading,
  totalDoctors,
  tabCounts,
}: DoctorsFiltersProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
        <div className="relative flex items-center w-full max-w-[300px]">
          <LuSearch className="absolute start-3 text-[14px] text-[hsl(var(--color-text-muted))]" />
          <input
            type="text"
            placeholder="Search name, email or specialty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-8 pe-3 py-1.5 text-[13px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto shrink-0">
        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full sm:w-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count = tab.value === "" ? totalDoctors : tabCounts[tab.value] ?? 0;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                    : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                }`}
              >
                {tab.label}
                {/* Always show badge */}
                {!isLoading && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
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

        {/* Quick-jump to Approvals page */}
        <button
          onClick={() => router.push("/admin/approvals")}
          className="inline-flex items-center justify-center flex-1 sm:flex-none gap-1.5 text-[12px] font-bold px-3 py-2 sm:py-1.5 rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] transition-all whitespace-nowrap cursor-pointer shadow-sm"
        >
          <LuFilter className="text-[12px]" />
          Manage Approvals
        </button>
      </div>
    </div>
  );
}
