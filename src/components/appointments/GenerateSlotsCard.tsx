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

  const handleGenerate = async (force: boolean = false) => {
    if (selectedDates.length === 0) {
      setError("Please select at least one date.");
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
      
      if (onSuccess && res.totalSlots !== undefined) {
        onSuccess(res.totalSlots);
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
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[hsl(var(--color-bg-subtle))] px-4 md:px-6 py-4 border-b border-[hsl(var(--color-border))] flex items-center gap-3">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-[hsl(var(--color-text))]">Generate Slots</h3>
      </div>
      
      <div className="p-4 md:p-6 flex-1 flex flex-col items-center">
        <p className="text-sm text-[hsl(var(--color-text-muted))] text-center mb-4">
          Select the specific dates you want to apply your Weekly Schedule to. You can pick multiple scattered dates.
        </p>

        <style dangerouslySetInnerHTML={{__html: `
          .rdp {
            --rdp-cell-size: 40px;
            --rdp-accent-color: hsl(var(--color-primary));
            --rdp-background-color: hsl(var(--color-primary) / 0.1);
            --rdp-outline: 2px solid var(--rdp-accent-color);
            margin: 0;
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
          onSelect={setSelectedDates as any}
          disabled={{ before: new Date() }}
          className="bg-white border rounded-lg p-2 shadow-sm"
        />

        {error && (
          <div className="mt-4 w-full p-3 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[hsl(var(--color-danger))] shrink-0 mt-0.5" />
            <p className="text-sm text-[hsl(var(--color-danger))]">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 w-full p-3 bg-[hsl(var(--color-success-bg))] border border-[hsl(var(--color-success)/0.2)] rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-[hsl(var(--color-success))] shrink-0 mt-0.5" />
            <p className="text-sm text-[hsl(var(--color-success))]">{success}</p>
          </div>
        )}

        <button
          onClick={() => handleGenerate(false)}
          disabled={loading || selectedDates.length === 0}
          className="mt-6 w-full py-2.5 px-4 bg-[hsl(var(--color-primary))] text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading && !forcingAction ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            `Generate Slots for ${selectedDates.length} ${selectedDates.length === 1 ? 'day' : 'days'}`
          )}
        </button>
      </div>

      {conflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-lg overflow-hidden p-6">
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-2 flex items-center gap-2">
              <span className="text-[hsl(var(--color-danger))]">⚠️</span> Conflicting Appointments Found
            </h3>
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] mb-4">
              You already have booked appointments in other clinics on the following dates. Are you sure you want to generate slots here as well?
            </p>

            <div className="max-h-40 overflow-y-auto border border-[hsl(var(--color-border))] rounded-lg p-2 mb-4 space-y-2">
              {conflict.conflictAppointments?.map((appt: any) => (
                <div key={appt._id} className="flex flex-col text-[12px] p-2 bg-[hsl(var(--color-bg-subtle))] rounded">
                  <span className="font-bold text-[hsl(var(--color-text))]">
                    {appt.clinicId?.name || "Another Clinic"}
                  </span>
                  <span className="text-[hsl(var(--color-text-muted))]">
                    {format(new Date(appt.startDateTime), "MMM d, yyyy - h:mm a")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConflict(null)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
                disabled={forcingAction}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setForcingAction(true);
                  await handleGenerate(true);
                  setForcingAction(false);
                }}
                disabled={forcingAction}
                className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-danger))] text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {forcingAction ? "Processing..." : "Force Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
