import React from "react";
import { LuSearch, LuFilter } from "react-icons/lu";
import { UserRole, UserStatus } from "@/types/user";
import { Input } from "@/components/ui/Input";

export const ROLE_OPTIONS: { label: string; value: UserRole | "" }[] = [
  { label: "All Roles", value: "" },
  { label: "Doctor", value: "doctor" },
  { label: "Patient", value: "patient" },
  { label: "Admin", value: "admin" },
];

export const STATUS_OPTIONS: { label: string; value: UserStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Blocked", value: "blocked" },
  { label: "Rejected", value: "rejected" },
];

interface UsersFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  roleFilter: UserRole | "";
  setRoleFilter: (val: UserRole | "") => void;
  statusFilter: UserStatus | "";
  setStatusFilter: (val: UserStatus | "") => void;
  roleCounts: Record<string, number>;
  statusCounts: Record<string, number>;
}

export default function UsersFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  roleCounts,
  statusCounts,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full mb-6 relative">
      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto order-2 lg:order-1 min-w-0">
        <div className="relative flex items-center shrink-0">
          <LuFilter className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))] pointer-events-none" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="pl-7 pr-8 py-1.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-pointer appearance-none w-full lg:min-w-[110px]"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-2.5 text-[11px] text-[hsl(var(--color-text-muted))] pointer-events-none">
            ▾
          </span>
        </div>

        {/* Status tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full sm:w-auto shrink-0">
          {STATUS_OPTIONS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count = tab.value === "" ? Object.values(statusCounts).reduce((a, b) => a + b, 0) : statusCounts[tab.value] ?? 0;
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

      <div className="w-full flex-1 order-1 lg:order-2">
        <Input
          size="sm"
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<LuSearch />}
          className="w-full !bg-[hsl(var(--color-bg-soft))] focus:!bg-[hsl(var(--color-bg-surface))] text-sm font-medium"
        />
      </div>
    </div>
  );
}
