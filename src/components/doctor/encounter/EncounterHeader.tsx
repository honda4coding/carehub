import { useState } from "react";
import { LuArrowLeft, LuPrinter, LuSave } from "react-icons/lu";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/global/NotificationBell";

interface EncounterHeaderProps {
  loading: boolean;
  patientData: any;
  sessionData: any;
  isAssessmentMode: boolean;
  isEnding: boolean;
  onBack: () => void;
  onPrint: () => void;
  onEndSession: (fees: number) => void;
  onCancelSession: () => void;
}

// Top header bar for the encounter page, handles printing and saving
export default function EncounterHeader({
  loading,
  patientData,
  sessionData,
  isAssessmentMode,
  isEnding,
  onBack,
  onPrint,
  onEndSession,
  onCancelSession
}: EncounterHeaderProps) {
  const [fees, setFees] = useState<number | "">("");

  return (
    <header className="no-print sticky top-0 z-30 bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-3 md:px-6 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-none">
        <button 
          onClick={onBack}
          className="w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
        >
          <LuArrowLeft className="text-xl text-[hsl(var(--color-text))]" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base md:text-xl font-black text-[hsl(var(--color-text))] truncate max-w-[120px] sm:max-w-xs md:max-w-sm">
                {loading ? "Loading Patient..." : patientData?.name}
              </h1>
              {!loading && patientData?.age && patientData.age !== "--" && (
                <span className="text-sm md:text-base font-semibold text-[hsl(var(--color-text-muted))] shrink-0 whitespace-nowrap">
                  ({patientData.age} years)
                </span>
              )}
            </div>
            {sessionData?.status === 'in_progress' && (
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 text-[9px] md:text-[10px] font-bold bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] rounded-full flex items-center gap-1 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                In Clinic
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3 w-full lg:w-auto shrink-0 mt-3 lg:mt-0">
        <NotificationBell basePath="/doctor" />
        <ThemeToggle />
        <button onClick={onPrint} className="flex items-center gap-2 text-[13px] sm:text-sm font-bold bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[hsl(var(--color-border))] transition-colors shrink-0">
          <LuPrinter className="text-lg shrink-0" /> <span className="hidden sm:inline">Print Report</span>
        </button>
        {isAssessmentMode && (
          <div className="flex items-center flex-1 sm:flex-none gap-2">
            {sessionData?.isOfflineEntry && (
              <button onClick={onCancelSession} disabled={isEnding} className="bg-red-500/10 text-red-600 hover:bg-red-500/20 text-[13px] sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0">
                Cancel Session
              </button>
            )}
            <button onClick={() => onEndSession(0)} disabled={isEnding} className="bg-[hsl(var(--color-primary))] text-white text-[13px] sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-[0_4px_12px_hsl(var(--color-primary)/0.25)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 shrink-0">
              {isEnding ? "Saving..." : <><LuSave className="text-lg hidden sm:block shrink-0" /> End Session</>}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
