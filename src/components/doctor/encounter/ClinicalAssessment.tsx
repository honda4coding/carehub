import { LuClipboardList, LuX } from "react-icons/lu";

interface ClinicalAssessmentProps {
  symptoms: string;
  setSymptoms: (text: string) => void;
  diagnosis: string;
  setDiagnosis: (text: string) => void;
  setIsAssessmentMode: (mode: boolean) => void;
}

// Handles taking the chief complaints and the final primary diagnosis
export default function ClinicalAssessment({
  symptoms,
  setSymptoms,
  diagnosis,
  setDiagnosis,
  setIsAssessmentMode
}: ClinicalAssessmentProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
          <LuClipboardList className="text-primary text-xl" /> Clinical Assessment
        </h2>
        <button 
          onClick={() => setIsAssessmentMode(false)} 
          className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] flex items-center gap-1 no-print border border-[hsl(var(--color-border))] px-3 py-1.5 rounded-lg bg-[hsl(var(--color-bg-soft))] transition-colors"
        >
          <LuX /> Cancel Assessment
        </button>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Chief Complaints / Symptoms</label>
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Patient reports..."
            className="w-full h-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Primary Diagnosis</label>
          <textarea 
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Bronchitis, detailed observations..."
            className="w-full h-24 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
          />
        </div>
      </div>
    </div>
  );
}
