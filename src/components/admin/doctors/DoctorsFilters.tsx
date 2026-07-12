import React from "react";
import { LuSearch, LuFilter } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { DoctorApprovalStatus } from "@/types/doctor";
import { Input } from "@/components/ui/Input";

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
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
      <div className="w-full lg:w-auto shrink-0 order-2 lg:order-1">
        {/* Status tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count = tab.value === "" ? Object.values(tabCounts).reduce((a, b) => a + b, 0) : tabCounts[tab.value] ?? 0;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
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

      <div className="w-full flex flex-row gap-2 order-1 lg:order-2">
        <div className="flex-1">
          <Input
            size="sm"
            type="text"
            placeholder="Search name, email or specialty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<LuSearch />}
            className="w-full !bg-[hsl(var(--color-bg-soft))] focus:!bg-[hsl(var(--color-bg-surface))] text-sm font-medium"
          />
        </div>

        {/* Quick-jump to Approvals page */}
        <button
          onClick={() => router.push("/admin/approvals")}
          className="inline-flex items-center justify-center gap-1.5 text-[12px] font-bold px-3 py-2 rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] transition-all whitespace-nowrap cursor-pointer shadow-sm"
        >
          <LuFilter className="text-[12px]" />
          <span className="hidden sm:inline">Manage Approvals</span>
        </button>
      </div>
    </div>
  );
}
