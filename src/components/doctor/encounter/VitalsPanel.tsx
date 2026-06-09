import { LuActivity, LuPen, LuRuler, LuWeight, LuDroplet, LuX, LuSave } from "react-icons/lu";

interface VitalsPanelProps {
  loading: boolean;
  patientData: any;
  isEditVitalsOpen: boolean;
  setIsEditVitalsOpen: (open: boolean) => void;
  editHeight: string;
  setEditHeight: (val: string) => void;
  editWeight: string;
  setEditWeight: (val: string) => void;
  editBloodType: string;
  setEditBloodType: (val: string) => void;
  saveVitalsLocally: () => void;
}

// Panel to display and edit basic patient vitals (Height, Weight, Blood Type)
export default function VitalsPanel({
  loading,
  patientData,
  isEditVitalsOpen,
  setIsEditVitalsOpen,
  editHeight,
  setEditHeight,
  editWeight,
  setEditWeight,
  editBloodType,
  setEditBloodType,
  saveVitalsLocally
}: VitalsPanelProps) {
  return (
    <>
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm relative group">
        <h3 className="text-sm font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-4 uppercase tracking-wider">
          <LuActivity className="text-primary" /> Patient Vitals
        </h3>
        <button 
          onClick={() => setIsEditVitalsOpen(true)} 
          className="no-print absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
        >
          <LuPen />
        </button>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-[hsl(var(--color-bg-soft))] px-3 py-2 rounded-lg border border-[hsl(var(--color-border-soft))]">
            <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuRuler/> Height</span>
            <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.height} cm</span>
          </div>
          <div className="flex justify-between items-center bg-[hsl(var(--color-bg-soft))] px-3 py-2 rounded-lg border border-[hsl(var(--color-border-soft))]">
            <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuWeight/> Weight</span>
            <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.weight} kg</span>
          </div>
          <div className="flex justify-between items-center bg-[hsl(var(--color-bg-soft))] px-3 py-2 rounded-lg border border-[hsl(var(--color-border-soft))]">
            <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuDroplet className="text-red-500" /> Blood</span>
            <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.bloodType}</span>
          </div>
        </div>
      </div>

      {isEditVitalsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[hsl(var(--color-border))] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                <LuActivity className="text-primary" /> Edit Vitals
              </h3>
              <button onClick={() => setIsEditVitalsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
                <LuX />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Height (cm)</label>
                <input 
                  type="number"
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                  placeholder="e.g. 175"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Weight (kg)</label>
                <input 
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                  placeholder="e.g. 70"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Blood Type</label>
                <select 
                  value={editBloodType}
                  onChange={(e) => setEditBloodType(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditVitalsOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveVitalsLocally}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <LuSave /> Save Locally
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
