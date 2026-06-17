import { useState } from "react";
import { LuArrowLeft, LuPrinter, LuSave } from "react-icons/lu";

interface EncounterHeaderProps {
  loading: boolean;
  patientData: any;
  sessionData: any;
  isAssessmentMode: boolean;
  isEnding: boolean;
  onBack: () => void;
  onPrint: () => void;
  onEndSession: (fees: number) => void;
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
  onEndSession
}: EncounterHeaderProps) {
  const [fees, setFees] = useState<number | "">("");

  return (
    <header className="no-print sticky top-0 z-30 bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
        >
          <LuArrowLeft className="text-xl text-[hsl(var(--color-text))]" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))]">
              {loading ? "Loading Patient..." : patientData?.name}
            </h1>
            {sessionData?.status === 'in_progress' && (
              <span className="px-2.5 py-1 text-[10px] font-bold bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                In Clinic
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button onClick={onPrint} className="hidden md:flex items-center gap-2 text-sm font-bold bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] transition-colors">
          <LuPrinter /> Print Report
        </button>
        {isAssessmentMode && (
          <div className="flex items-center gap-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-1 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            <span className="text-[hsl(var(--color-text-muted))] font-bold pl-3 text-sm">Fees:</span>
            <input 
              type="number" 
              placeholder="Optional"
              value={fees}
              onChange={(e) => setFees(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-24 bg-transparent text-[hsl(var(--color-text))] font-black text-sm p-1.5 focus:outline-none placeholder:text-[hsl(var(--color-text-muted))/0.5]"
            />
            <button onClick={() => onEndSession(Number(fees) || 0)} disabled={isEnding} className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-lg shadow-[0_4px_12px_hsl(var(--color-primary)/0.25)] hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50">
              {isEnding ? "Saving..." : <><LuSave className="text-lg" /> End</>}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
