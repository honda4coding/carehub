"use client";

import React, { useState } from "react";
import { LuClock, LuCalendarDays, LuX } from "react-icons/lu";

export interface MedicationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: any;
  onSave: (schedule: any) => Promise<void>;
}

export default function MedicationScheduleModal({ isOpen, onClose, medication, onSave }: MedicationScheduleModalProps) {
  const [scheduleType, setScheduleType] = useState<"specific_times" | "interval">("specific_times");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [intervalHours, setIntervalHours] = useState<number>(4);
  const [intervalStartTime, setIntervalStartTime] = useState<string>("08:00");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !medication) return null;

  const handleAddTime = () => {
    setTimes([...times, "12:00"]);
  };

  const handleTimeChange = (index: number, val: string) => {
    const newTimes = [...times];
    newTimes[index] = val;
    setTimes(newTimes);
  };

  const handleRemoveTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        prescriptionId: medication.prescriptionId,
        medicationId: medication.medicationId || medication._id,
        medicineName: medication.medicineName,
        scheduleType,
        times: scheduleType === "specific_times" ? times : [],
        intervalData: scheduleType === "interval" ? { hours: intervalHours, startTime: intervalStartTime } : undefined
      });
      onClose();
    } catch (error) {
      console.error("Failed to save schedule", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-[hsl(var(--color-bg))] rounded-2xl w-full max-w-md shadow-2xl border border-[hsl(var(--color-border))] overflow-hidden flex flex-col"
        style={{ animation: "scaleIn 0.3s ease-out forwards" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-[hsl(var(--color-border))] flex items-center justify-between bg-[hsl(var(--color-bg-soft))]">
          <div>
            <h2 className="text-[18px] font-black text-[hsl(var(--color-text))] flex items-center gap-2">
              <LuClock className="text-[hsl(var(--color-primary))]" /> Set Reminder
            </h2>
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))] mt-1">
              {medication.medicineName}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors border border-[hsl(var(--color-border))]">
            <LuX />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl mb-6">
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${scheduleType === "specific_times" ? "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-primary))] shadow-sm border border-[hsl(var(--color-border))]" : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"}`}
              onClick={() => setScheduleType("specific_times")}
            >
              Specific Times
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${scheduleType === "interval" ? "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-primary))] shadow-sm border border-[hsl(var(--color-border))]" : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"}`}
              onClick={() => setScheduleType("interval")}
            >
              Interval
            </button>
          </div>

          {scheduleType === "specific_times" ? (
            <div className="space-y-4">
              <label className="text-[13px] font-bold text-[hsl(var(--color-text))] block">When do you want to be reminded?</label>
              <div className="space-y-3">
                {times.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input 
                      type="time" 
                      value={t}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      className="flex-1 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-3 text-[15px] font-bold text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                    />
                    {times.length > 1 && (
                      <button onClick={() => handleRemoveTime(idx)} className="p-3 text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-bg))] rounded-xl border border-[hsl(var(--color-danger)/0.2)]">
                        <LuX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddTime}
                className="w-full py-3 rounded-xl border-2 border-dashed border-[hsl(var(--color-primary)/0.3)] text-[hsl(var(--color-primary))] font-bold hover:bg-[hsl(var(--color-primary)/0.05)] transition-colors mt-2"
              >
                + Add Another Time
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-[13px] font-bold text-[hsl(var(--color-text))] block mb-2">Remind me every</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    min={1} 
                    max={72} 
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(Number(e.target.value))}
                    className="w-24 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-3 text-[15px] font-bold text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                  />
                  <span className="font-bold text-[hsl(var(--color-text-muted))]">Hours</span>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-[hsl(var(--color-text))] block mb-2">Starting from</label>
                <input 
                  type="time" 
                  value={intervalStartTime}
                  onChange={(e) => setIntervalStartTime(e.target.value)}
                  className="w-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-3 text-[15px] font-bold text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                />
              </div>
            </div>
          )}

          {/* AUDIO ALARM COMMENTED OUT FEATURE */}
          {/*
          <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--color-warning-bg))] border border-[hsl(var(--color-warning)/0.2)]">
             <div className="flex items-center justify-between mb-2">
               <span className="font-black text-[13px] text-[hsl(var(--color-warning))] flex items-center gap-2"><LuBellRing /> Play Loud Alarm</span>
               <input type="checkbox" className="toggle-checkbox" defaultChecked />
             </div>
             <p className="text-xs font-bold text-[hsl(var(--color-warning)/0.7)] leading-relaxed">
               If the app is open, we will play a continuous alarm sound until you mark the medication as taken.
             </p>
          </div>
          */}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))]">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[hsl(var(--color-primary))] text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSaving ? "Saving..." : "Save Reminder"}
          </button>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scaleIn {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}} />
      </div>
    </div>
  );
}
