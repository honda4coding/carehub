import { useState } from "react";
import { LuActivity, LuPen, LuRuler, LuWeight, LuDroplet, LuX, LuSave, LuHeart, LuThermometer, LuTestTube } from "react-icons/lu";

interface VitalsPanelProps {
  loading: boolean;
  patientData: any;
  isEditVitalsOpen: boolean;
  setIsEditVitalsOpen: (open: boolean) => void;
  editHeight: string;
  setEditHeight: (val: string) => void;
  editWeight: string;
  setEditWeight: (val: string) => void;
  editBloodPressure: string;
  setEditBloodPressure: (val: string) => void;
  editSugarLevel: string;
  setEditSugarLevel: (val: string) => void;
  editPulse: string;
  setEditPulse: (val: string) => void;
  editTemperature: string;
  setEditTemperature: (val: string) => void;
  editBloodType: string;
  setEditBloodType: (val: string) => void;
  saveVitalsLocally: () => void;
  lastVisitVitals?: any;
}

// Panel to display and edit basic patient vitals (Height, Weight, Blood Type)
export default function VitalsPanel({
  loading,
  patientData,
  isEditVitalsOpen,
  setIsEditVitalsOpen,
  editHeight, setEditHeight,
  editWeight, setEditWeight,
  editBloodPressure, setEditBloodPressure,
  editSugarLevel, setEditSugarLevel,
  editPulse, setEditPulse,
  editTemperature, setEditTemperature,
  editBloodType, setEditBloodType,
  saveVitalsLocally,
  lastVisitVitals
}: VitalsPanelProps) {
  const [isEditBloodTypeOpen, setIsEditBloodTypeOpen] = useState(false);

  return (
    <div className="space-y-4">
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
        <div className="space-y-6">
          {/* Section 1: Base Semi-Static Info */}
          <div>
            <h4 className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Base Info</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mb-1"><LuRuler/> Height</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.height} cm</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mb-1"><LuWeight/> Weight</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.weight} kg</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm group/blood relative overflow-hidden">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mb-1"><LuDroplet className="text-red-500"/> Blood</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.bloodType || "Unknown"}</span>
                <button 
                  onClick={() => setIsEditBloodTypeOpen(true)} 
                  className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover/blood:opacity-100 transition-opacity"
                  title="Edit Blood Type"
                >
                  <LuPen className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Last Visit Readings */}
          {lastVisitVitals && (
            <div>
              <h4 className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">
                Last Visit ({new Date(lastVisitVitals.date).toLocaleDateString()})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuHeart className="text-rose-500" /> B.P.</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.bloodPressure || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">mmHg</span></span>
                </div>
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuTestTube className="text-blue-500" /> Sugar</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.sugarLevel || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">mg/dL</span></span>
                </div>
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuActivity className="text-orange-500" /> Pulse</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.pulse || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">bpm</span></span>
                </div>
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuThermometer className="text-yellow-500" /> Temp</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.temperature || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">°C</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Today's Readings */}
          <div className="p-4 bg-[hsl(var(--color-primary)/0.03)] border border-[hsl(var(--color-primary)/0.15)] rounded-2xl relative">
            <button 
              onClick={() => setIsEditVitalsOpen(true)} 
              className="no-print absolute top-3 right-3 text-[10px] font-bold text-primary bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.2)] px-3 py-1.5 rounded-md transition-colors"
            >
              Update
            </button>
            <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">Today's Readings</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuHeart className="text-rose-500" /> B.P.</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editBloodPressure || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">mmHg</span></span>
              </div>
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuTestTube className="text-blue-500" /> Sugar</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editSugarLevel || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">mg/dL</span></span>
              </div>
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuActivity className="text-orange-500" /> Pulse</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editPulse || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">bpm</span></span>
              </div>
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] shadow-sm hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuThermometer className="text-yellow-500" /> Temp</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editTemperature || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">°C</span></span>
              </div>
            </div>
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
            
            <div className="space-y-6">
              
              {/* Group 1: Base Info */}
              <div className="p-4 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] rounded-xl">
                <h4 className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-3">Base Patient Info</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Height (cm)</label>
                    <input 
                      type="number"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="e.g. 175"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Weight (kg)</label>
                    <input 
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="e.g. 70"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Today's Readings */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">Today's Checkup Readings</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Blood Pressure</label>
                    <input 
                      type="text"
                      value={editBloodPressure}
                      onChange={(e) => setEditBloodPressure(e.target.value)}
                      className="w-full border border-primary/20 bg-white dark:bg-black/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Sugar Level</label>
                    <input 
                      type="number"
                      value={editSugarLevel}
                      onChange={(e) => setEditSugarLevel(e.target.value)}
                      className="w-full border border-primary/20 bg-white dark:bg-black/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="90"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Pulse (bpm)</label>
                    <input 
                      type="number"
                      value={editPulse}
                      onChange={(e) => setEditPulse(e.target.value)}
                      className="w-full border border-primary/20 bg-white dark:bg-black/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Temp (°C)</label>
                    <input 
                      type="number" step="0.1"
                      value={editTemperature}
                      onChange={(e) => setEditTemperature(e.target.value)}
                      className="w-full border border-primary/20 bg-white dark:bg-black/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="37.0"
                    />
                  </div>
                </div>
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
                <LuSave /> Update Vitals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blood Type Edit Modal */}
      {isEditBloodTypeOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[hsl(var(--color-border))] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                <LuDroplet className="text-red-500" /> Update Blood Type
              </h3>
              <button onClick={() => setIsEditBloodTypeOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
                <LuX />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Blood Type</label>
                <select 
                  value={editBloodType}
                  onChange={(e) => setEditBloodType(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-base font-bold focus:border-primary outline-none transition-colors"
                >
                  <option value="">Select Blood Type</option>
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
                onClick={() => setIsEditBloodTypeOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  saveVitalsLocally();
                  setIsEditBloodTypeOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <LuSave /> Save Blood Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
