import { useState } from "react";
import { LuActivity, LuPen, LuRuler, LuWeight, LuDroplet, LuX, LuSave, LuHeart, LuThermometer, LuTestTube } from "react-icons/lu";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("auto");
  const [isEditBloodTypeOpen, setIsEditBloodTypeOpen] = useState(false);

  // Calculate BMI
  let bmi = "--";
  let bmiStatus = "";
  let bmiColor = "text-[hsl(var(--color-text-muted))]";

  if (patientData?.height && patientData?.weight && patientData.height !== "-" && patientData.weight !== "-") {
    const h = parseFloat(patientData.height) / 100; // in meters
    const w = parseFloat(patientData.weight);
    if (h > 0 && w > 0) {
      const bmiVal = w / (h * h);
      bmi = bmiVal.toFixed(1);
      
      if (bmiVal < 18.5) { bmiStatus = "Underweight"; bmiColor = "text-primary"; }
      else if (bmiVal < 25) { bmiStatus = "Normal"; bmiColor = "text-success"; }
      else if (bmiVal < 30) { bmiStatus = "Overweight"; bmiColor = "text-warning"; }
      else { bmiStatus = "Obese"; bmiColor = "text-danger"; }
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 relative group">
        <h3 className="text-sm font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-4 uppercase tracking-wider">
          <LuActivity className="text-primary" /> {t('patientVitals')}</h3>
        <button 
          onClick={() => setIsEditVitalsOpen(true)} 
          className="no-print absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] opacity-100 transition-colors hover:bg-[hsl(var(--color-primary)/0.1)] hover:text-primary hover:border-[hsl(var(--color-primary)/0.3)]"
        >
          <LuPen />
        </button>
        <div className="space-y-6">
          {/* Section 1: Base Semi-Static Info */}
          <div>
            <h4 className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">{t('baseInfo')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-center justify-center bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))]">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mb-1"><LuRuler/> {t('height')}</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">
                  {loading || !patientData?.height || patientData.height === "-" ? "--" : patientData.height} <span className="text-[9px] font-semibold text-[hsl(var(--color-text-muted))]">{t('cm')}</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))]">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mb-1"><LuWeight/> {t('weight')}</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">
                  {loading || !patientData?.weight || patientData.weight === "-" ? "--" : patientData.weight} <span className="text-[9px] font-semibold text-[hsl(var(--color-text-muted))]">{t('kg')}</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))] relative group/bmi">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mb-1">
                  <LuActivity className={bmiColor}/> {t('bmi')}</span>
                <span className={`text-sm font-black text-[hsl(var(--color-text))] ${bmi !== "--" && "mb-1"}`}>{bmi}</span>
                {bmiStatus && (
                  <span className={`absolute -bottom-2 text-[8px] font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--color-bg-surface))] ${bmiColor} border border-[hsl(var(--color-border-soft))]`}>
                    {bmiStatus}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center justify-center bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))] group/blood relative">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mb-1"><LuDroplet className="text-danger"/> {t('blood')}</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.bloodType || "Unknown"}</span>
                <button 
                  onClick={() => setIsEditBloodTypeOpen(true)} 
                  className="absolute top-1.5 end-1.5 w-5 h-5 flex items-center justify-center rounded-md bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] opacity-100 transition-colors hover:bg-[hsl(var(--color-primary)/0.1)] hover:text-primary"
                  title={t('editBloodType')}
                >
                  <LuPen className="text-[10px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Last Visit Readings */}
          {lastVisitVitals && (
            <div>
              <h4 className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">
                {t('lastVisit')}{new Date(lastVisitVitals.date).toLocaleDateString()})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuHeart className="text-rose-500" /> {t('bp_jqg2')}</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.bloodPressure || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('mmhg')}</span></span>
                </div>
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuTestTube className="text-primary" /> {t('sugar')}</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.sugarLevel || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('mgdl')}</span></span>
                </div>
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuActivity className="text-orange-500" /> {t('pulse')}</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.pulse || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('bpm')}</span></span>
                </div>
                <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuThermometer className="text-warning" /> {t('temp')}</span>
                  <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{lastVisitVitals.temperature || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('c')}</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Today's Readings */}
          <div className="p-4 bg-[hsl(var(--color-primary)/0.03)] border border-[hsl(var(--color-primary)/0.15)] rounded-2xl relative">
            <button 
              onClick={() => setIsEditVitalsOpen(true)} 
              className="no-print absolute top-3 end-3 text-[10px] font-bold text-primary bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.2)] px-3 py-1.5 rounded-md transition-colors"
            >
              {t('update')}</button>
            <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">{t('todaysReadings')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuHeart className="text-rose-500" /> {t('bp_4bii')}</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editBloodPressure || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('mmhg')}</span></span>
              </div>
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuTestTube className="text-primary" /> {t('sugar')}</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editSugarLevel || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('mgdl')}</span></span>
              </div>
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuActivity className="text-orange-500" /> {t('pulse')}</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editPulse || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('bpm')}</span></span>
              </div>
              <div className="bg-[hsl(var(--color-bg-surface))] px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] hover:border-primary/30 transition-colors">
                <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuThermometer className="text-warning" /> {t('temp')}</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))] block mt-1">{editTemperature || "--"} <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{t('c')}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditVitalsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-md p-6 border border-[hsl(var(--color-border))] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                <LuActivity className="text-primary" /> {t('editVitals')}</h3>
              <button onClick={() => setIsEditVitalsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
                <LuX />
              </button>
            </div>
            
            <div className="space-y-6">
              
              {/* Group 1: Base Info */}
              <div className="p-4 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] rounded-xl">
                <h4 className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-3">{t('basePatientInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('heightCm')}</label>
                    <input 
                      type="number"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder={t('eg175')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('weightKg')}</label>
                    <input 
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder={t('eg70')}
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Today's Readings */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">{t('todaysCheckupReadings')}</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('bloodPressure_oby2')}</label>
                    <input 
                      type="text"
                      value={editBloodPressure}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d]/g, ""); // Allow only digits
                        if (val.length > 3) val = val.substring(0, 3) + "/" + val.substring(3, 5);
                        else if (val.length > 2 && val.startsWith("9")) val = val.substring(0, 2) + "/" + val.substring(2, 4); // special case for 90/60
                        setEditBloodPressure(val);
                      }}
                      className="w-full border border-primary/20 bg-white dark:bg-black/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="120/80"
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('sugarLevel_c5o2')}</label>
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
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('pulseBpm')}</label>
                    <input 
                      type="number"
                      value={editPulse}
                      onChange={(e) => setEditPulse(e.target.value)}
                      className="w-full border border-primary/20 bg-white dark:bg-black/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('tempC')}</label>
                    <input 
                      type="text"
                      value={editTemperature}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d]/g, "");
                        if (val.length > 2) val = val.substring(0, 2) + "." + val.substring(2, 3);
                        setEditTemperature(val);
                      }}
                      className="w-full border border-primary/20 bg-white dark:bg-black/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                      placeholder="37.5"
                      maxLength={4}
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
                {t('cancel')}</button>
              <button 
                onClick={saveVitalsLocally}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 /20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <LuSave /> {t('updateVitals')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Blood Type Edit Modal */}
      {isEditBloodTypeOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-sm p-6 border border-[hsl(var(--color-border))] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                <LuDroplet className="text-danger" /> {t('updateBloodType')}</h3>
              <button onClick={() => setIsEditBloodTypeOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
                <LuX />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase mb-1">{t('bloodType')}</label>
                <select 
                  value={editBloodType}
                  onChange={(e) => setEditBloodType(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-base font-bold focus:border-primary outline-none transition-colors"
                >
                  <option value="">{t('selectBloodType')}</option>
                  <option value="A+">{t('a')}</option>
                  <option value="A-">{t('a_dgsa')}</option>
                  <option value="B+">{t('b')}</option>
                  <option value="B-">{t('b_ybo1')}</option>
                  <option value="AB+">{t('ab')}</option>
                  <option value="AB-">{t('ab_1ttm')}</option>
                  <option value="O+">{t('o')}</option>
                  <option value="O-">{t('o_pr5g')}</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditBloodTypeOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
              >
                {t('cancel')}</button>
              <button 
                onClick={() => {
                  saveVitalsLocally();
                  setIsEditBloodTypeOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 /20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <LuSave /> {t('saveBloodType')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
