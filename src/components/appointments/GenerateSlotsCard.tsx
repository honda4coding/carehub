"use client";

import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { generateSlots } from "@/services/appointmentService";
import { CheckCircle, AlertCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";

interface GenerateSlotsCardProps {
  clinicId?: string;
  onSuccess?: (totalSlots: number) => void;
}

export default function GenerateSlotsCard({ clinicId, onSuccess }: GenerateSlotsCardProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [conflict, setConflict] = useState<any | null>(null);
  const [forcingAction, setForcingAction] = useState(false);

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setSelectedDates([]);
      return;
    }
    if (dates.length > 30) {
      setError("You cannot select more than 30 days at once.");
      setSelectedDates(dates.slice(0, 30));
    } else {
      setError(null);
      setSelectedDates(dates);
    }
  };

  const handleGenerate = async (force: boolean = false) => {
    if (selectedDates.length === 0) {
      setError("Please select at least one date.");
      return;
    }
    if (selectedDates.length > 30) {
      setError("You cannot generate slots for more than 30 days at once.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const datesStringArray = selectedDates.map(date => format(date, "yyyy-MM-dd"));
      
      const payload = {
        clinicId,
        dates: datesStringArray,
        ...(force && { force: true }),
      };

      const res = await generateSlots(payload);
      
      setSuccess(res.message || `Generated slots successfully.`);
      setSelectedDates([]);
      setConflict(null);
      
      const anyRes = res as any;
      const total = anyRes.totalGenerated ?? anyRes.totalSlots ?? anyRes.count;
      if (onSuccess && total !== undefined) {
        onSuccess(total);
      }
    } catch (err: any) {
      if (err.status === 409 && err.data?.conflicts) {
        setConflict(err.data);
      } else {
        setError(err.response?.data?.message || err.message || "Failed to generate slots");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[hsl(var(--color-primary))]" />
          <div>
            <h3 className="font-bold text-lg text-[hsl(var(--color-text))]">Generate Slots</h3>
            <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
              Select specific dates to apply your schedule to (Max 30)
            </p>
          </div>
        </div>
        {selectedDates.length > 0 && (
          <span className="text-[12px] font-bold text-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.1)] px-3 py-1.5 rounded-full">
            {selectedDates.length} / 30 Selected
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-center bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-xl p-4 overflow-x-auto">
          <style dangerouslySetInnerHTML={{__html: `
            .rdp {
              --rdp-cell-size: 38px;
              --rdp-accent-color: hsl(var(--color-primary));
              --rdp-background-color: hsl(var(--color-primary) / 0.1);
              --rdp-outline: 2px solid var(--rdp-accent-color);
              margin: 0;
              font-family: inherit;
            }
            .rdp-months {
              justify-content: center;
              gap: 2rem;
            }
            .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
              color: white;
              background-color: var(--rdp-accent-color);
            }
          `}} />
          <DayPicker
            mode="multiple"
            min={1}
            selected={selectedDates}
            onSelect={handleDateSelect}
            disabled={{ before: new Date() }}
            numberOfMonths={2}
            pagedNavigation
            className="m-0"
          />
        </div>

        <div className="flex flex-col">
          {error && (
            <div className="mb-4 w-full p-3 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-xl flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--color-danger))] shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium text-[hsl(var(--color-danger))] leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 w-full p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium text-emerald-700 leading-relaxed">{success}</p>
            </div>
          )}

          {conflict && (
            <div className="mb-4 w-full p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-3 animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] text-amber-800 font-bold mb-1">Schedule Conflicts Detected</p>
                  <p className="text-[12px] font-medium text-amber-700 mb-2 leading-relaxed">
                    Some generated slots conflict with existing ones. 
                  </p>
                  <ul className="list-disc list-inside text-[12px] font-medium text-amber-800 space-y-1 mb-3">
                    {conflict.conflicts.slice(0, 3).map((c: any, i: number) => (
                      <li key={i}>{new Date(c.start).toLocaleString()} - {new Date(c.end).toLocaleTimeString()}</li>
                    ))}
                    {conflict.conflicts.length > 3 && (
                      <li>...and {conflict.conflicts.length - 3} more</li>
                    )}
                  </ul>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => setConflict(null)}
                      className="px-3 py-1.5 text-[12px] font-bold text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        setForcingAction(true);
                        handleGenerate(true).finally(() => setForcingAction(false));
                      }}
                      disabled={forcingAction}
                      className="px-3 py-1.5 text-[12px] font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {forcingAction ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Generate Anyway
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => handleGenerate(false)}
            disabled={loading || selectedDates.length === 0 || selectedDates.length > 30}
            className="w-full bg-[hsl(var(--color-primary))] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && !forcingAction ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate ${selectedDates.length > 0 ? selectedDates.length : ''} Slots`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
