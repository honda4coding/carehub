import { LuHistory, LuPlus, LuStethoscope, LuFileText } from "react-icons/lu";
import { RefObject } from "react";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";

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
      
      {/* Start Assessment CTA */}
      <div className="bg-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.15)] rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-xl font-black text-[hsl(var(--color-text))] mb-2 flex items-center gap-2">
            <LuStethoscope className="text-primary text-2xl" /> Ready for today's visit?
          </h2>
          <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] max-w-lg">
            Review the patient's medical history below. When you're ready to start the clinical assessment and prescribe new medications, enter the assessment mode.
          </p>
        </div>
        <button 
          onClick={() => setIsAssessmentMode(true)}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl shadow-[0_8px_16px_hsl(var(--color-primary)/0.2)] hover:shadow-[0_8px_24px_hsl(var(--color-primary)/0.3)] hover:-translate-y-1 transition-all whitespace-nowrap flex items-center gap-2"
        >
          <LuPlus className="text-xl" /> Start Assessment
        </button>
      </div>

      {/* Full Timeline */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-[hsl(var(--color-border))] pb-4">
          <h3 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuHistory className="text-primary text-xl" /> Full Medical History
          </h3>
          <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto">
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase text-[hsl(var(--color-text-muted))] ml-1 mb-0.5">Start</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-3 py-2 text-xs font-medium focus:border-primary outline-none text-[hsl(var(--color-text-muted))]"
                  title="Start Date"
                />
              </div>
              <span className="text-[hsl(var(--color-border))] pb-2">-</span>
              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase text-[hsl(var(--color-text-muted))] ml-1 mb-0.5">End</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-3 py-2 text-xs font-medium focus:border-primary outline-none text-[hsl(var(--color-text-muted))]"
                  title="End Date"
                />
              </div>
            </div>
            <div className="relative w-full sm:w-auto">
              <input 
                type="text"
                placeholder="Search doctor, diagnosis..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full sm:w-56 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2 text-xs font-medium focus:border-primary outline-none"
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
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[hsl(var(--color-bg-surface))] bg-[hsl(var(--color-primary)/0.1)] text-primary font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  <LuFileText />
                </div>
                {/* Timeline Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                  <MedicalHistoryCard record={record} />
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
