import React from "react";
import { LuSearch, LuFilter } from "react-icons/lu";
import { UserRole, UserStatus } from "@/types/user";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("auto");
  return (
    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
        <div className="relative flex items-center w-full max-w-[300px]">
          <LuSearch className="absolute start-3 text-[14px] text-[hsl(var(--color-text-muted))]" />
          <input
            type="text"
            placeholder={t('searchNameOrEmail')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-8 pe-3 py-1.5 text-[13px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto shrink-0">
        {/* Role & Status filters */}
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <div className="relative flex items-center w-full sm:w-auto">
            <LuFilter className="absolute start-2.5 text-[12px] text-[hsl(var(--color-text-muted))] pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
              className="ps-7 pe-7 py-1.5 text-[12px] font-semibold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] appearance-none cursor-pointer transition-all w-full sm:w-auto"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="absolute end-2.5 text-[11px] text-[hsl(var(--color-text-muted))] pointer-events-none">
              ▾
            </span>
          </div>

          {/* Status filter */}
          <div className="relative flex items-center w-full sm:w-auto">
            <LuFilter className="absolute start-2.5 text-[12px] text-[hsl(var(--color-text-muted))] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}
              className="ps-7 pe-7 py-1.5 text-[12px] font-semibold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] appearance-none cursor-pointer transition-all w-full sm:w-auto"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="absolute end-2.5 text-[11px] text-[hsl(var(--color-text-muted))] pointer-events-none">
              ▾
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
