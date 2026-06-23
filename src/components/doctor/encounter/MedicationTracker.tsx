import { LuPill, LuHistory } from "react-icons/lu";

interface MedicationTrackerProps {
  activeMeds: any[];
  pastMeds: any[];
}

// Shows a quick summary of the patient's active and past medications
export default function MedicationTracker({ activeMeds, pastMeds }: MedicationTrackerProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 relative group space-y-5">
      <div>
        <h3 className="text-sm font-black text-[hsl(var(--color-success))] flex items-center gap-2 mb-3 uppercase tracking-wider">
          <LuPill /> Active Medications
        </h3>
        <div className="space-y-2">
          {activeMeds.length > 0 ? activeMeds.map((med: any, idx: number) => (
            <div key={idx} className="bg-[hsl(var(--color-success-bg))] border border-[hsl(var(--color-success))/0.2] p-2.5 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="text-[11px] font-bold text-[hsl(var(--color-success))]">{med.name} <span className="text-[10px] opacity-80">{med.dosage}</span></p>
                {med.isLifelong && <span className="bg-[hsl(var(--color-success))] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Lifelong</span>}
              </div>
              <p className="text-[10px] font-medium text-[hsl(var(--color-success))/0.7] mt-0.5">Prescribed: {med.date} by Dr. {med.doctorId}</p>
            </div>
          )) : <span className="text-xs text-[hsl(var(--color-text-muted))]">None active</span>}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-[hsl(var(--color-text-muted))] flex items-center gap-2 mb-3 uppercase tracking-wider">
          <LuHistory /> Past Medications
        </h3>
        <div className="space-y-2">
          {pastMeds.length > 0 ? pastMeds.slice(0, 3).map((med: any, idx: number) => (
            <div key={idx} className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] p-2.5 rounded-lg opacity-75 grayscale">
              <p className="text-[11px] font-bold text-[hsl(var(--color-text))]">{med.name} <span className="text-[10px] text-[hsl(var(--color-text-muted))]">{med.dosage}</span></p>
              <p className="text-[9px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">Ended. Prescribed {med.date}</p>
            </div>
          )) : <span className="text-xs text-[hsl(var(--color-text-muted))]">No past history</span>}
          {pastMeds.length > 3 && <p className="text-[10px] text-center font-bold text-[hsl(var(--color-text-muted))]">+ {pastMeds.length - 3} more</p>}
        </div>
      </div>
    </div>
  );
}
