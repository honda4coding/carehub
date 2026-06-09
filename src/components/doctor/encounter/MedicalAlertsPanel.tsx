import { LuTriangleAlert, LuPen, LuX, LuSave, LuPlus, LuTrash2 } from "react-icons/lu";

interface MedicalAlertsPanelProps {
  loading: boolean;
  patientData: any;
  isEditAlertsOpen: boolean;
  setIsEditAlertsOpen: (open: boolean) => void;
  editAllergies: string;
  setEditAllergies: (val: string) => void;
  editChronic: string;
  setEditChronic: (val: string) => void;
  editSurgeries: { operationName: string; surgeonName?: string; date?: string; report?: string }[];
  setEditSurgeries: (val: { operationName: string; surgeonName?: string; date?: string; report?: string }[]) => void;
  saveAlertsLocally: () => void;
}

// Panel to view and edit patient's allergies, chronic diseases, and past surgeries
export default function MedicalAlertsPanel({
  loading,
  patientData,
  isEditAlertsOpen,
  setIsEditAlertsOpen,
  editAllergies,
  setEditAllergies,
  editChronic,
  setEditChronic,
  editSurgeries,
  setEditSurgeries,
  saveAlertsLocally
}: MedicalAlertsPanelProps) {

  const addSurgery = () => {
    setEditSurgeries([...editSurgeries, { operationName: "", surgeonName: "", date: "", report: "" }]);
  };

  const updateSurgery = (index: number, field: string, value: string) => {
    const newSurgeries = [...editSurgeries];
    newSurgeries[index] = { ...newSurgeries[index], [field]: value };
    setEditSurgeries(newSurgeries);
  };

  const removeSurgery = (index: number) => {
    const newSurgeries = [...editSurgeries];
    newSurgeries.splice(index, 1);
    setEditSurgeries(newSurgeries);
  };

  return (
    <>
      <div className="bg-[hsl(var(--color-danger)/0.05)] border border-[hsl(var(--color-danger)/0.1)] rounded-2xl p-5 shadow-sm relative group">
        <h3 className="text-sm font-black text-[hsl(var(--color-danger))] flex items-center gap-2 mb-4 uppercase tracking-wider">
          <LuTriangleAlert /> Medical Alerts
        </h3>
        <button 
          onClick={() => setIsEditAlertsOpen(true)} 
          className="no-print absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-danger)/0.5)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[hsl(var(--color-danger))]"
        >
          <LuPen />
        </button>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {!loading && patientData?.allergies?.length > 0 
                ? patientData.allergies.map((a: string, i: number) => <span key={`${a}-${i}`} className="bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] text-[11px] font-bold px-2 py-1 rounded-md">{a}</span>) 
                : <span className="text-xs text-[hsl(var(--color-text-muted))]">None reported</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1 mt-3">Chronic</p>
            <div className="flex flex-wrap gap-2">
              {!loading && patientData?.chronic?.length > 0 
                ? patientData.chronic.map((c: string, i: number) => <span key={`${c}-${i}`} className="bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] text-[11px] font-bold px-2 py-1 rounded-md">{c}</span>) 
                : <span className="text-xs text-[hsl(var(--color-text-muted))]">None reported</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1 mt-3">Operations</p>
            <div className="flex flex-wrap gap-2">
              {!loading && patientData?.surgeries?.length > 0 
                ? patientData.surgeries.map((s: any, i: number) => (
                <div key={`${s.operationName}-${i}`} className="group/tooltip relative">
                  <span className="bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] text-[11px] font-bold px-2 py-1 rounded-md cursor-help border border-[hsl(var(--color-primary)/0.2)]">
                    {s.operationName}
                  </span>
                  {/* Tooltip */}
                  {(s.date || s.report) && (
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2.5 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                      {s.surgeonName && <p className="text-[10px] font-bold text-[hsl(var(--color-text))] mb-1">Surgeon: {s.surgeonName}</p>}
                      {s.date && <p className="text-[10px] font-bold text-[hsl(var(--color-primary))] mb-1">{s.date}</p>}
                      {s.report && <p className="text-[10px] text-[hsl(var(--color-text-muted))] whitespace-pre-wrap">{s.report}</p>}
                    </div>
                  )}
                </div>
              )) : <span className="text-xs text-[hsl(var(--color-text-muted))]">None reported</span>}
            </div>
          </div>
        </div>
      </div>

      {isEditAlertsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[hsl(var(--color-border))] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[hsl(var(--color-bg-surface))] pb-2 border-b border-[hsl(var(--color-border))] z-10">
              <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                <LuTriangleAlert className="text-primary" /> Edit Medical Alerts
              </h3>
              <button onClick={() => setIsEditAlertsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
                <LuX />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Allergies (comma separated)</label>
                <textarea 
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors min-h-[80px]"
                  placeholder="e.g. Penicillin, Peanuts"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">Chronic Diseases (comma separated)</label>
                <textarea 
                  value={editChronic}
                  onChange={(e) => setEditChronic(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors min-h-[80px]"
                  placeholder="e.g. Diabetes Type 2, Hypertension"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase">Past Surgeries / Operations</label>
                  <button onClick={addSurgery} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                    <LuPlus /> Add Surgery
                  </button>
                </div>
                
                <div className="space-y-4">
                  {editSurgeries.map((surgery, index) => (
                    <div key={index} className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] p-4 rounded-xl relative group">
                      <button onClick={() => removeSurgery(index)} className="absolute top-2 right-2 text-[hsl(var(--color-danger)/0.5)] hover:text-[hsl(var(--color-danger))]">
                        <LuTrash2 />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 pr-6">
                        <div>
                          <label className="block text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1">Operation Name *</label>
                          <input type="text" value={surgery.operationName} onChange={(e) => updateSurgery(index, "operationName", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-xs focus:border-primary outline-none" placeholder="e.g. Appendectomy" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1">Date</label>
                          <input type="text" value={surgery.date || ""} onChange={(e) => updateSurgery(index, "date", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-xs focus:border-primary outline-none" placeholder="e.g. Jan 2020" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1">Surgeon Name</label>
                          <input type="text" value={surgery.surgeonName || ""} onChange={(e) => updateSurgery(index, "surgeonName", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-xs focus:border-primary outline-none" placeholder="e.g. Dr. Ahmed" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1">Brief Report / Notes</label>
                          <textarea value={surgery.report || ""} onChange={(e) => updateSurgery(index, "report", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-xs focus:border-primary outline-none h-16" placeholder="Any complications or notes..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  {editSurgeries.length === 0 && (
                    <p className="text-xs text-center text-[hsl(var(--color-text-muted))] py-4 italic border border-dashed border-[hsl(var(--color-border))] rounded-xl">No surgeries added.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-[hsl(var(--color-bg-surface))] pt-4 border-t border-[hsl(var(--color-border))] z-10">
              <button 
                onClick={() => setIsEditAlertsOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveAlertsLocally}
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
