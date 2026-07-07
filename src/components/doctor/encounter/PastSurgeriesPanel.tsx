import { LuScissors, LuPen, LuX, LuSave, LuPlus, LuTrash2 } from "react-icons/lu";

interface PastSurgeriesPanelProps {
  loading: boolean;
  patientData: any;
  isEditSurgeriesOpen: boolean;
  setIsEditSurgeriesOpen: (open: boolean) => void;
  editSurgeries: { operationName: string; surgeonName?: string; date?: string; report?: string }[];
  setEditSurgeries: (val: { operationName: string; surgeonName?: string; date?: string; report?: string }[]) => void;
  saveSurgeries: () => void;
  isSaving: boolean;
}

// Panel to view and edit patient's past surgeries and operations
export default function PastSurgeriesPanel({
  loading,
  patientData,
  isEditSurgeriesOpen,
  setIsEditSurgeriesOpen,
  editSurgeries,
  setEditSurgeries,
  saveSurgeries,
  isSaving
}: PastSurgeriesPanelProps) {

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
      <div className="bg-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.1)] rounded-2xl p-5 relative group mt-6">
        <h3 className="text-sm font-black text-[hsl(var(--color-primary))] flex items-center gap-2 mb-4 uppercase tracking-wider">
          <LuScissors /> Surgeries
        </h3>
        <button 
          onClick={() => setIsEditSurgeriesOpen(true)} 
          className="no-print absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-primary)/0.1)] border border-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))] opacity-100 transition-colors hover:bg-[hsl(var(--color-primary)/0.2)]"
        >
          <LuPen />
        </button>
        <div className="space-y-3">
          <div>
            <div className="flex flex-col gap-2">
              {!loading && patientData?.surgeries?.length > 0 
                ? patientData.surgeries.map((s: any, i: number) => (
                <div key={`${s.operationName}-${i}`} className="group/tooltip relative">
                  <span className="bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] text-[11px] font-bold px-2 py-1 rounded-md cursor-help border border-[hsl(var(--color-primary)/0.2)] block w-fit">
                    {s.operationName}
                  </span>
                  {/* Tooltip */}
                  {(s.date || s.report || s.surgeonName) && (
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2.5 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                      {s.surgeonName && <p className="text-[10px] font-bold text-[hsl(var(--color-text))] mb-1">Surgeon: {s.surgeonName}</p>}
                      {s.date && <p className="text-[10px] font-bold text-[hsl(var(--color-primary))] mb-1">{s.date}</p>}
                      {s.report && <p className="text-[10px] text-[hsl(var(--color-text-muted))] whitespace-pre-wrap">{s.report}</p>}
                    </div>
                  )}
                </div>
              )) : <span className="text-xs text-[hsl(var(--color-text-muted))]">No surgeries reported.</span>}
            </div>
          </div>
        </div>
      </div>

      {isEditSurgeriesOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-[hsl(var(--color-border))] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[hsl(var(--color-bg-surface))] pb-2 border-b border-[hsl(var(--color-border))] z-10">
              <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                <LuScissors className="text-primary" /> Edit Surgeries
              </h3>
              <button onClick={() => setIsEditSurgeriesOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
                <LuX />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-[hsl(var(--color-text-muted))]">List all operations and surgical procedures the patient has undergone.</p>
                  <button onClick={addSurgery} className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline bg-primary/10 px-3 py-1.5 rounded-lg">
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
                          <input type="text" value={surgery.operationName} onChange={(e) => updateSurgery(index, "operationName", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] rounded-lg px-3 py-2 text-xs focus:border-[hsl(var(--color-primary))] outline-none" placeholder="e.g. Appendectomy" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1">Date</label>
                          <input type="text" value={surgery.date || ""} onChange={(e) => updateSurgery(index, "date", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] rounded-lg px-3 py-2 text-xs focus:border-[hsl(var(--color-primary))] outline-none" placeholder="e.g. Jan 2020" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1">Surgeon Name</label>
                          <input type="text" value={surgery.surgeonName || ""} onChange={(e) => updateSurgery(index, "surgeonName", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] rounded-lg px-3 py-2 text-xs focus:border-[hsl(var(--color-primary))] outline-none" placeholder="e.g. Dr. Ahmed" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1">Brief Report / Notes</label>
                          <textarea value={surgery.report || ""} onChange={(e) => updateSurgery(index, "report", e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] rounded-lg px-3 py-2 text-xs focus:border-[hsl(var(--color-primary))] outline-none h-16" placeholder="Any complications or notes..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  {editSurgeries.length === 0 && (
                    <p className="text-xs text-center text-[hsl(var(--color-text-muted))] py-6 border border-dashed border-[hsl(var(--color-border))] rounded-xl">No surgeries added yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-[hsl(var(--color-bg-surface))] pt-4 border-t border-[hsl(var(--color-border))] z-10">
              <button 
                onClick={() => setIsEditSurgeriesOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={saveSurgeries}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <LuSave /> {isSaving ? "Saving..." : "Update Surgeries"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
