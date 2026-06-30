import { LuTriangleAlert, LuPen, LuX, LuSave, LuPlus, LuTrash2 } from "react-icons/lu";
import { useTranslations } from "next-intl";

interface MedicalAlertsPanelProps {
  loading: boolean;
  patientData: any;
  isEditAlertsOpen: boolean;
  setIsEditAlertsOpen: (open: boolean) => void;
  editAllergies: string;
  setEditAllergies: (val: string) => void;
  editChronic: string;
  setEditChronic: (val: string) => void;
  saveAlerts: () => void;
  isSaving: boolean;
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
  saveAlerts,
  isSaving
}: MedicalAlertsPanelProps) {
    const t = useTranslations("auto");

  return (
    <>
      <div className="bg-[hsl(var(--color-danger)/0.05)] border border-[hsl(var(--color-danger)/0.1)] rounded-2xl p-5 relative group">
        <h3 className="text-sm font-black text-[hsl(var(--color-danger))] flex items-center gap-2 mb-4 uppercase tracking-wider">
          <LuTriangleAlert /> {t('medicalAlerts')}</h3>
        <button 
          onClick={() => setIsEditAlertsOpen(true)} 
          className="no-print absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-danger)/0.1)] border border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))] opacity-100 transition-colors hover:bg-[hsl(var(--color-danger)/0.2)]"
        >
          <LuPen />
        </button>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1">{t('allergies')}</p>
            <div className="flex flex-wrap gap-2">
              {!loading && patientData?.allergies?.length > 0 
                ? patientData.allergies.map((a: string, i: number) => <span key={`${a}-${i}`} className="bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] text-[11px] font-bold px-2 py-1 rounded-md">{a}</span>) 
                : <span className="text-xs text-[hsl(var(--color-text-muted))]">{t('noneReported')}</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1 mt-3">{t('chronic')}</p>
            <div className="flex flex-wrap gap-2">
              {!loading && patientData?.chronic?.length > 0 
                ? patientData.chronic.map((c: string, i: number) => <span key={`${c}-${i}`} className="bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] text-[11px] font-bold px-2 py-1 rounded-md">{c}</span>) 
                : <span className="text-xs text-[hsl(var(--color-text-muted))]">{t('noneReported')}</span>}
            </div>
          </div>
        </div>
      </div>

      {isEditAlertsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-[hsl(var(--color-border))] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[hsl(var(--color-bg-surface))] pb-2 border-b border-[hsl(var(--color-border))] z-10">
              <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                <LuTriangleAlert className="text-primary" /> {t('editMedicalAlerts')}</h3>
              <button onClick={() => setIsEditAlertsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
                <LuX />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('allergiesCommaSeparated')}</label>
                <textarea 
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors min-h-[80px]"
                  placeholder={t('egPenicillinPeanuts')}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('chronicDiseasesCommaSeparated')}</label>
                <textarea 
                  value={editChronic}
                  onChange={(e) => setEditChronic(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors min-h-[80px]"
                  placeholder={t('egDiabetesType2')}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-[hsl(var(--color-bg-surface))] pt-4 border-t border-[hsl(var(--color-border))] z-10">
              <button 
                onClick={() => setIsEditAlertsOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
                disabled={isSaving}
              >
                {t('cancel')}</button>
              <button 
                onClick={saveAlerts}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 /20 flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <LuSave /> {isSaving ? "Saving..." : "Update Alerts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
