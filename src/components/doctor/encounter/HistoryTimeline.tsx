import { LuHistory, LuPlus, LuStethoscope, LuFileText, LuCalendar, LuChevronDown, LuChevronUp } from "react-icons/lu";
import { RefObject, useState } from "react";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

function TimelineAccordionCard({ record }: { record: any }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 hover:border-primary/50 transition-all cursor-pointer group w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-primary))] group-hover:bg-[hsl(var(--color-primary))] group-hover:text-white transition-colors">
            <LuCalendar className="text-lg" />
          </span>
          <div>
            <p className="text-[15px] font-black text-[hsl(var(--color-text))]">{dateStr} <span className="text-[13px] text-[hsl(var(--color-text-muted))] ml-1">{timeStr}</span></p>
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
               <LuStethoscope className="text-[hsl(var(--color-primary))] flex-shrink-0" /> 
               {record.diagnosis || "No diagnosis recorded"}
            </p>
          </div>
        </div>
        
        <button className="text-[hsl(var(--color-text-muted))] p-1 rounded-md hover:bg-[hsl(var(--color-bg-soft))] transition-colors cursor-pointer">
          {expanded ? <LuChevronUp className="text-xl" /> : <LuChevronDown className="text-xl" />}
        </button>
      </div>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-4 cursor-auto border-t border-[hsl(var(--color-border))] pt-4" onClick={(e) => e.stopPropagation()}>
          <MedicalHistoryCard record={record} hideHeader={true} />
        </div>
      )}
    </div>
  );
}

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

// Displays the patient's past visits, diagnoses, and prescriptions with infinite scrolling
export default function HistoryTimeline({
  setIsAssessmentMode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filterText,
  setFilterText,
  loadingHistory,
  page,
  fullMedicalHistory,
  hasMore,
  observerTarget
}: HistoryTimelineProps) {
  return (
    <div className="space-y-6">
      
      {/* Start Assessment CTA Removed */}

      {/* Full Timeline */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 mb-6 border-b border-[hsl(var(--color-border))] pb-4">
          <h3 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2 shrink-0">
            <LuHistory className="text-primary text-xl shrink-0" /> Full Medical History
          </h3>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full 2xl:w-auto">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onReset={startDate || endDate ? () => { setStartDate(""); setEndDate(""); } : undefined}
            />
            <div className="relative w-full lg:w-auto flex-1 min-w-0">
              <input 
                type="text"
                placeholder="Search doctor, diagnosis..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full lg:w-56 min-w-0 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2 text-xs font-medium focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {loadingHistory && page === 1 ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[hsl(var(--color-border))] border-t-primary animate-spin"></div></div>
        ) : fullMedicalHistory.length > 0 ? (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[hsl(var(--color-border))] before:to-transparent">
            {fullMedicalHistory.map((record: any, index: number) => (
              <div key={record._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[hsl(var(--color-bg-surface))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <LuFileText />
                </div>
                {/* Timeline Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                  <TimelineAccordionCard record={record} />
                </div>
              </div>
            ))}
            
            {/* Infinite Scroll Observer Target */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-6 w-full z-10 relative">
                <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--color-border))] border-t-primary animate-spin"></div>
              </div>
            )}
            {!hasMore && fullMedicalHistory.length > 0 && (
              <div className="text-center py-4 text-xs font-bold text-[hsl(var(--color-text-muted))] relative z-10 bg-[hsl(var(--color-bg-surface))] inline-block px-4 mx-auto md:left-1/2 md:-translate-x-1/2 rounded-full border border-[hsl(var(--color-border-soft))]">
                End of history.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl">
            <LuHistory className="text-4xl text-[hsl(var(--color-border-soft))] mx-auto mb-3" />
            <p className="text-base font-bold text-[hsl(var(--color-text))] mb-1">No Medical History</p>
            <p className="text-sm font-medium text-[hsl(var(--color-text-muted))]">This appears to be the patient's first visit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
