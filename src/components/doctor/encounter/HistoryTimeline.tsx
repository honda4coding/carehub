import {
  LuHistory, LuStethoscope, LuFileText, LuCalendar,
  LuChevronDown, LuChevronUp, LuSearch, LuX,
  LuHeartPulse, LuActivity, LuThermometer,
} from "react-icons/lu";
import { RefObject, useState } from "react";

import DateRangeFilter from "@/components/ui/DateRangeFilter";

import TimelineAccordionCard from "@/components/shared/TimelineAccordionCard";

/* ── Props ── */
interface HistoryTimelineProps {
  setIsAssessmentMode: (mode: boolean) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  loadingHistory: boolean;
  page: number;
  fullMedicalHistory: any[];
  hasMore: boolean;
  observerTarget: RefObject<HTMLDivElement | null>;
}

/* ── Main Component ── */
export default function HistoryTimeline({
  setIsAssessmentMode,
  startDate, setStartDate,
  endDate, setEndDate,
  filterText, setFilterText,
  loadingHistory, page,
  fullMedicalHistory,
  hasMore, observerTarget,
}: HistoryTimelineProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
        <h3 className="text-[15px] font-semibold text-[hsl(var(--color-text))] flex items-center gap-2 shrink-0">
          <LuHistory className="text-[hsl(var(--color-primary))]" /> Full medical history
        </h3>
        <div className="flex flex-wrap items-center gap-3 w-full 2xl:w-auto">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={startDate || endDate ? () => { setStartDate(""); setEndDate(""); } : undefined}
            className="!mt-0 flex-1 min-w-[280px]"
          />
          <div className="relative flex-1 min-w-[200px]">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search doctor, diagnosis…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-[12px] font-medium rounded-xl border border-[hsl(var(--color-border))]
                bg-[hsl(var(--color-bg-surface-hover))] outline-none text-[hsl(var(--color-text))]
                focus:border-[hsl(var(--color-primary))] transition-colors
                placeholder:text-[hsl(var(--color-text-muted)/0.5)]"
            />
            {filterText && (
              <button
                onClick={() => setFilterText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] cursor-pointer"
              >
                <LuX className="text-[12px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {loadingHistory && page === 1 ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-[hsl(var(--color-bg-surface-hover))] rounded-2xl border border-[hsl(var(--color-border))]" />
            ))}
          </div>
        ) : fullMedicalHistory.length > 0 ? (
          <div className="space-y-3">
            {fullMedicalHistory.map((record: any, index: number) => (
              <TimelineAccordionCard key={record._id || index} record={record} />
            ))}

            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-5">
                <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--color-primary))] border-t-transparent animate-spin" />
              </div>
            )}
            {!hasMore && fullMedicalHistory.length > 3 && (
              <p className="text-center text-[12px] font-medium text-[hsl(var(--color-text-muted))] pt-3 border-t border-[hsl(var(--color-border))]">
                — End of history · {fullMedicalHistory.length} records —
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-14 border border-dashed border-[hsl(var(--color-border))] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--color-bg-surface-hover))] flex items-center justify-center mx-auto mb-3">
              <LuHistory className="text-[22px] text-[hsl(var(--color-text-muted))]" />
            </div>
            <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] mb-1">No medical history</p>
            <p className="text-[13px] text-[hsl(var(--color-text-muted))]">This appears to be the patient's first visit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
