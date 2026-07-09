"use client";

import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { generateSlots } from "@/services/appointmentService";
import { CheckCircle, AlertCircle, Loader2, X, Calendar as CalendarIcon } from "lucide-react";

interface GenerateSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId?: string;
  onSuccess?: (totalSlots: number) => void;
}

export default function GenerateSlotsModal({ isOpen, onClose, clinicId, onSuccess }: GenerateSlotsModalProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [conflict, setConflict] = useState<any | null>(null);
  const [forcingAction, setForcingAction] = useState(false);

  if (!isOpen) return null;

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
      
      const anyRes = res as any;
      const total = anyRes.totalGenerated ?? anyRes.totalSlots ?? anyRes.count;
      if (total === 0) {
        setConflict(null);
        setError("These slots are in the past and cannot be generated.");
        setLoading(false);
        return;
      }

      setSuccess(res.message || `Generated slots successfully.`);
      setSelectedDates([]);
      setConflict(null);
      
      if (onSuccess && total !== undefined) {
        onSuccess(total);
      }
      
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
      
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors p-1 bg-[hsl(var(--color-bg-base))] rounded-full hover:bg-[hsl(var(--color-bg-subtle))]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-subtle))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[16px] text-[hsl(var(--color-text))]">Generate Slots</h3>
              <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
                Select up to 30 custom dates
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col items-center">
          <style dangerouslySetInnerHTML={{__html: `
            .rdp-root {
              --rdp-accent-color: hsl(var(--color-primary));
              --rdp-accent-background-color: hsl(var(--color-primary) / 0.1);
              --rdp-today-color: hsl(var(--color-primary));
              --rdp-selected-border: none;
              --rdp-day-height: 38px;
              --rdp-day-width: 38px;
              margin: 0;
            }
            /* Override selected day */
            .rdp-selected {
              color: white !important;
              background-color: hsl(var(--color-primary)) !important;
              font-weight: bold !important;
            }
            /* Override today's day */
            .rdp-today:not(.rdp-selected) {
              color: hsl(var(--color-primary)) !important;
              background-color: hsl(var(--color-primary) / 0.15) !important;
              font-weight: bold !important;
            }
            /* Nav buttons */
            .rdp-nav_button {
              color: hsl(var(--color-text-muted)) !important;
            }
            .rdp-nav_button:hover {
              color: hsl(var(--color-text)) !important;
              background-color: hsl(var(--color-bg-subtle)) !important;
            }
          `}} />
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-3 shadow-sm w-full flex justify-center mb-4">
            <DayPicker
              mode="multiple"
              min={1}
              selected={selectedDates}
              onSelect={handleDateSelect}
              disabled={{ before: new Date() }}
              className="m-0"
            />
          </div>

          <div className="w-full">
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
                    <p className="text-[13px] text-amber-800 font-bold mb-1">Schedule Conflicts</p>
                    <p className="text-[12px] font-medium text-amber-700 mb-2 leading-relaxed">
                      Some generated slots conflict with existing ones. 
                    </p>
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
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] flex items-center justify-between">
          <span className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
            {selectedDates.length} / 30 Selected
          </span>
          <button
            onClick={() => handleGenerate(false)}
            disabled={loading || selectedDates.length === 0 || selectedDates.length > 30}
            className="bg-[hsl(var(--color-primary))] text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {loading && !forcingAction ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wait...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
