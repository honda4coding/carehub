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
}

export default function UsersFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
      <div className="w-full lg:w-auto shrink-0 order-2 lg:order-1">
        {/* Role & Status filters */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <div className="flex items-center gap-2 flex-1 lg:flex-none">
            <div className="relative flex items-center w-full lg:w-auto">
              <LuFilter className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))] pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="pl-7 pr-8 py-1.5 text-[12px] font-bold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-pointer appearance-none w-full lg:min-w-[110px]"
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

            <div className="relative flex items-center w-full lg:w-auto">
              <LuFilter className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))] pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-7 pr-8 py-1.5 text-[12px] font-bold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-pointer appearance-none w-full lg:min-w-[120px]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 text-[11px] text-[hsl(var(--color-text-muted))] pointer-events-none">
                ▾
              </span>
            </div>
          </div>
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
