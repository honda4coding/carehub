import React from "react";
import { LuSearch, LuFilter } from "react-icons/lu";
import { Input } from "@/components/ui/Input";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

interface PatientDirectoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  onReset: () => void;
}

export default function PatientDirectoryFilters({
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  typeFilter,
  setTypeFilter,
  onReset,
}: PatientDirectoryFiltersProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 mb-6">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <Input
            type="text"
            placeholder="Search by patient name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<LuSearch className="text-lg text-[hsl(var(--color-text-muted))]" />}
            className="w-full text-sm bg-[hsl(var(--color-bg-soft))] focus:bg-[hsl(var(--color-bg-surface))]"
          />
        </div>

        {/* Date Filter */}
        <div className="shrink-0">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {/* Type Filter */}
        <div className="relative shrink-0 min-w-[150px]">
          <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--color-text-muted))]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-sm font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer appearance-none focus:border-primary transition-colors h-[42px]"
          >
            <option value="All">All Visit Types</option>
            <option value="Online">Online</option>
            <option value="Walk-in">Walk-in</option>
          </select>
        </div>

        {/* Reset Filter */}
        <button
          onClick={onReset}
          className="shrink-0 px-4 py-2.5 bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] font-bold text-sm rounded-xl hover:bg-[hsl(var(--color-danger)/0.15)] transition-colors border border-[hsl(var(--color-danger)/0.2)] cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
