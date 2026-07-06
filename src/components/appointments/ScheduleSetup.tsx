"use client";

import { useEffect, useState, useRef } from "react";
import {
  LuCalendarDays,
  LuCheck,
  LuChevronDown,
  LuClock,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import {
  Availability,
  deleteAvailability,
  deleteSlot,
  getAvailableSlots,
  getClinicAvailability,
  setAvailability,
  updateAvailability,
} from "@/services/appointmentService";

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
type Day = (typeof DAYS)[number];

const DAY_LABELS: Record<Day, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

const DURATIONS = [15, 20, 30, 45, 60] as const;

interface ScheduleSetupProps {
  clinicName?: string;
  clinicId?: string;
  doctorId?: string;
  onDayDeleted?: () => void;
  onToast: (msg: string, variant: "success" | "error") => void;
  onSelectedDaysChange?: (hasDays: boolean) => void;
}

type DayConfig = {
  startTime: string;
  endTime: string;
  appointmentDuration: number;
};

export default function ScheduleSetup({
  clinicId,
  clinicName,
  doctorId,
  onToast,
  onSelectedDaysChange,
  onDayDeleted,
}: ScheduleSetupProps) {
  const [loadingAvailability, setLoadingAvailability] = useState(!!clinicId);
  const [selectedDays, setSelectedDays] = useState<Set<Day>>(new Set());
  const [timeConfig, setTimeConfig] = useState<Partial<Record<Day, DayConfig>>>(
    {},
  );
  const [savedIds, setSavedIds] = useState<Partial<Record<Day, string>>>({});
  const [expandedDay, setExpandedDay] = useState<Day | null>(null);
  const [savingDay, setSavingDay] = useState<Day | null>(null);
  const [deletingDay, setDeletingDay] = useState<Day | null>(null);
  const prevTimeConfigRef = useRef<Partial<Record<Day, DayConfig>>>(timeConfig);

  // Load existing availability for this clinic on mount
  useEffect(() => {
    if (!clinicId) return;
    (async () => {
      try {
        const data: Availability[] = await getClinicAvailability(clinicId);
        const days = new Set<Day>();
        const config: Partial<Record<Day, DayConfig>> = {};
        const ids: Partial<Record<Day, string>> = {};
        data.forEach((a) => {
          const day = a.day?.toLowerCase() as Day;
          if (!DAYS.includes(day)) return;
          days.add(day);
          config[day] = {
            startTime: a.startTime,
            endTime: a.endTime,
            appointmentDuration: a.appointmentDuration,
          };
          ids[day] = a._id;
        });
        setSelectedDays(days);
        setTimeConfig(config);
        prevTimeConfigRef.current = config;
        setSavedIds(ids);
      } catch {
        // silently fail
      } finally {
        setLoadingAvailability(false);
      }
    })();
  }, [clinicId]);

  // Single source of truth for parent onSelectedDaysChange
  useEffect(() => {
    if (onSelectedDaysChange) onSelectedDaysChange(selectedDays.size > 0);
  }, [selectedDays]);

  async function toggleDay(day: Day) {
    if (selectedDays.has(day)) {
      const id = savedIds[day];
      if (id) {
        const confirmed = window.confirm(
          `Remove ${DAY_LABELS[day]} from your schedule? This will also delete all open slots for this day.`,
        );
        if (!confirmed) return;
        await handleDeleteDay(day);
      } else {
        // not saved yet — remove from UI only
        setSelectedDays((prev) => {
          const n = new Set(prev);
          n.delete(day);
          return n;
        });
      }
    } else {
      setSelectedDays((prev) => {
        const n = new Set(prev);
        n.add(day);
        return n;
      });
      if (!timeConfig[day]) {
        const initialConfig = {
          startTime: "09:00",
          endTime: "17:00",
          appointmentDuration: 30,
        };
        setTimeConfig((tc) => ({
          ...tc,
          [day]: initialConfig,
        }));
        // Auto-save will pick this up!
      }
      setExpandedDay(day);
    }
  }

  // Auto-save effect
  useEffect(() => {
    if (loadingAvailability) return;
    
    const changedDays = DAYS.filter(day => {
      const prev = prevTimeConfigRef.current[day];
      const curr = timeConfig[day];
      if (!prev && curr) return true;
      if (prev && curr) {
        return prev.startTime !== curr.startTime || 
               prev.endTime !== curr.endTime || 
               prev.appointmentDuration !== curr.appointmentDuration;
      }
      return false;
    });

    if (changedDays.length > 0) {
      const timer = setTimeout(async () => {
        for (const day of changedDays) {
          if (selectedDays.has(day)) {
            await handleSaveDay(day, true);
          }
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [timeConfig, selectedDays, loadingAvailability]);

  async function handleSaveDay(day: Day, isSilent: boolean = false) {
    const tc = timeConfig[day];
    if (!tc?.startTime || !tc?.endTime) return;
    setSavingDay(day);
    try {
      const existingId = savedIds[day];
      if (existingId) {
        await updateAvailability(existingId, {
          day,
          startTime: tc.startTime,
          endTime: tc.endTime,
          appointmentDuration: tc.appointmentDuration,
        });
        if (!isSilent) onToast(`${DAY_LABELS[day]} availability updated`, "success");
      } else {
        const saved = await setAvailability({
          ...(clinicId ? { clinicId } : {}),
          day,
          startTime: tc.startTime,
          endTime: tc.endTime,
          appointmentDuration: tc.appointmentDuration,
        });
        setSavedIds((prev) => ({ ...prev, [day]: saved._id }));
        if (!isSilent) onToast(`${DAY_LABELS[day]} availability saved`, "success");
      }
      prevTimeConfigRef.current[day] = { ...tc };
    } catch (err: any) {
      onToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to save availability",
        "error",
      );
    } finally {
      setSavingDay(null);
    }
  }

  async function handleDeleteDay(day: Day) {
    const id = savedIds[day];
    if (!id) {
      setSelectedDays((prev) => {
        const n = new Set(prev);
        n.delete(day);
        return n;
      });
      return;
    }
    setDeletingDay(day);
    try {
      await deleteAvailability(id);

      setSelectedDays((prev) => {
        const n = new Set(prev);
        n.delete(day);
        return n;
      });
      setTimeConfig((prev) => {
        const n = { ...prev };
        delete n[day];
        return n;
      });
      setSavedIds((prev) => {
        const n = { ...prev };
        delete n[day];
        return n;
      });
      prevTimeConfigRef.current[day] = undefined;
      onToast(`${DAY_LABELS[day]} availability removed`, "success");
      onDayDeleted?.();
    } catch (err: any) {
      onToast(
        err.response?.data?.message ||
          err.message ||
          "Could not remove this day",
        "error",
      );
    } finally {
      setDeletingDay(null);
    }
  }

  if (loadingAvailability) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[52px] rounded-xl bg-[hsl(var(--color-bg-subtle))] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-3">
        {DAYS.map((day) => {
          const isSelected = selectedDays.has(day);
          const isExpanded = expandedDay === day;
          const tc = timeConfig[day];
          const isSaved = !!savedIds[day];

          return (
            <div
              key={day}
              className={`rounded-xl transition-all duration-200 border ${
                isSelected
                  ? isExpanded ? "bg-white border-[hsl(var(--color-border))] shadow-md" : "bg-[hsl(var(--color-bg-subtle))] border-[hsl(var(--color-border))]"
                  : "bg-transparent border-transparent hover:bg-[hsl(var(--color-bg-subtle))] hover:border-[hsl(var(--color-border))]"
              }`}
            >
              <div 
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none rounded-xl ${isExpanded && isSelected ? 'border-b border-[hsl(var(--color-border))] rounded-b-none' : ''}`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  if (isSelected) {
                    setExpandedDay(isExpanded ? null : day);
                  } else {
                    toggleDay(day);
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDay(day);
                  }}
                  disabled={deletingDay === day}
                  className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 ${
                    isSelected
                      ? "bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-white"
                      : "border-[hsl(var(--color-border))] bg-white"
                  }`}
                >
                  {isSelected && <LuCheck className="text-[12px] font-black" />}
                </button>

                <div className="flex-1 flex items-center gap-2">
                  <span
                    className={`text-[14px] font-bold ${
                      isSelected ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </span>
                  {isSaved && (
                    <span className="text-[10px] font-bold text-[hsl(var(--color-success))] bg-[hsl(var(--color-success-bg))] px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                {isSelected && tc && (
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-[hsl(var(--color-text))]">
                      {tc.startTime} - {tc.endTime}
                    </span>
                    <LuChevronDown
                      className={`text-[hsl(var(--color-text-muted))] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                    {isSaved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDay(day);
                        }}
                        disabled={deletingDay === day}
                        className="p-1.5 text-[hsl(var(--color-text-muted))] hover:text-white hover:bg-[hsl(var(--color-danger))] transition-colors disabled:opacity-40 rounded-lg"
                        title="Remove Day"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isSelected && isExpanded && (
                <div className="p-5 bg-white rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={tc?.startTime ?? "09:00"}
                        onChange={(e) =>
                          setTimeConfig((prev) => ({
                            ...prev,
                            [day]: {
                              ...prev[day]!,
                              startTime: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] text-[14px] font-bold outline-none focus:border-[hsl(var(--color-primary))] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={tc?.endTime ?? "17:00"}
                        onChange={(e) =>
                          setTimeConfig((prev) => ({
                            ...prev,
                            [day]: { ...prev[day]!, endTime: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] text-[14px] font-bold outline-none focus:border-[hsl(var(--color-primary))] transition-all"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2">
                      Appointment Duration
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {DURATIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setTimeConfig((prev) => ({
                              ...prev,
                              [day]: { ...prev[day]!, appointmentDuration: d },
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all border ${
                            tc?.appointmentDuration === d
                              ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] border-[hsl(var(--color-primary)/0.3)]"
                              : "border-[hsl(var(--color-border))] bg-white text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-primary)/0.5)] hover:text-[hsl(var(--color-text))]"
                          }`}
                        >
                          {d} min
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end h-6">
                    {savingDay === day ? (
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                        <LuClock className="animate-spin w-3.5 h-3.5" />
                        Saving...
                      </span>
                    ) : isSaved ? (
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--color-success))]">
                        <LuCheck className="w-3.5 h-3.5" />
                        Saved
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
