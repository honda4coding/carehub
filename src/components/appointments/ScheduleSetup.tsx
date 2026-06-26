"use client";

import { useEffect, useState } from "react";
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
}: ScheduleSetupProps) {
  const [loadingAvailability, setLoadingAvailability] = useState(!!clinicId);
  const [selectedDays, setSelectedDays] = useState<Set<Day>>(new Set());
  const [timeConfig, setTimeConfig] = useState<Partial<Record<Day, DayConfig>>>({});
  const [savedIds, setSavedIds] = useState<Partial<Record<Day, string>>>({});
  const [expandedDay, setExpandedDay] = useState<Day | null>(null);
  const [savingDay, setSavingDay] = useState<Day | null>(null);
  const [deletingDay, setDeletingDay] = useState<Day | null>(null);

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
          `Remove ${DAY_LABELS[day]} from your schedule? This will also delete all open slots for this day.`
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
        setTimeConfig((tc) => ({
          ...tc,
          [day]: { startTime: "09:00", endTime: "17:00", appointmentDuration: 30 },
        }));
      }
    }
  }

  async function handleSaveDay(day: Day) {
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
        onToast(`${DAY_LABELS[day]} availability updated`, "success");
      } else {
        const saved = await setAvailability({
          ...(clinicId ? { clinicId } : {}),
          day,
          startTime: tc.startTime,
          endTime: tc.endTime,
          appointmentDuration: tc.appointmentDuration,
        });
        setSavedIds((prev) => ({ ...prev, [day]: saved._id }));
        onToast(`${DAY_LABELS[day]} availability saved`, "success");
      }
      setExpandedDay(null);
    } catch (err: any) {
      onToast(err.message || "Failed to save availability", "error");
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

      // Delete all open slots for this day
      const daySlots = await getAvailableSlots(doctorId ?? "", clinicId).catch(() => []);
      const toDelete = daySlots.filter((s: any) => {
        const slotDay = new Date(s.startTime)
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        return slotDay === day;
      });
      await Promise.all(toDelete.map((s: any) => deleteSlot(s._id))).catch(() => {});

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
      onToast(`${DAY_LABELS[day]} availability removed`, "success");
    } catch (err: any) {
      onToast(err.message || "Could not remove this day", "error");
    } finally {
      setDeletingDay(null);
    }
  }

  if (loadingAvailability) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[46px] rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <LuCalendarDays className="text-[hsl(var(--color-primary))] text-base" />
        <p className="text-base font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
          Weekly schedule
        </p>
      </div>
      <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mb-5">
        Pick your working days and hours
        {clinicName ? ` for ${clinicName}` : clinicId ? " for this clinic" : ""}
      </p>

      <div className="space-y-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.has(day);
          const isExpanded = expandedDay === day;
          const tc = timeConfig[day];
          const isSaved = !!savedIds[day];

          return (
            <div
              key={day}
              className={`border rounded-xl overflow-hidden transition-all duration-150 ${
                isSelected
                  ? "border-primary bg-[hsl(var(--color-primary)/0.04)]"
                  : "border-[hsl(var(--color-border))]"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleDay(day)}
                  disabled={deletingDay === day}
                  className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer disabled:opacity-40 ${
                    isSelected
                      ? "bg-[hsl(var(--color-primary)/0.15)] border-primary text-primary"
                      : "border-[hsl(var(--color-border))] bg-transparent"
                  }`}
                >
                  {isSelected && <LuCheck className="text-base font-black" />}
                </button>

                <span
                  className={`text-base font-bold flex-1 flex items-center gap-1.5 ${
                    isSelected
                      ? "text-[hsl(var(--color-text))]"
                      : "text-[hsl(var(--color-text-muted))]"
                  }`}
                >
                  {DAY_LABELS[day]}
                  {isSaved && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]">
                      Saved
                    </span>
                  )}
                </span>

                {isSelected && tc && (
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day)}
                    className="flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--color-text))] hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    {tc.startTime} – {tc.endTime}
                    <LuChevronDown
                      className={`text-base transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}

                {isSaved && (
                  <button
                    onClick={() => handleDeleteDay(day)}
                    disabled={deletingDay === day}
                    className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                  >
                    <LuTrash2 className="text-base" />
                  </button>
                )}
              </div>

              {isSelected && isExpanded && (
                <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-black uppercase tracking-wide text-[hsl(var(--color-text))] mb-2">
                        Start Time
                      </label>
                      <div className="relative group">
                        <input
                          type="time"
                          value={tc?.startTime ?? "09:00"}
                          onChange={(e) =>
                            setTimeConfig((prev) => ({
                              ...prev,
                              [day]: { ...prev[day]!, startTime: e.target.value },
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-base font-bold outline-none focus:border-[hsl(var(--color-text))] focus:bg-[hsl(var(--color-bg-surface))] transition-all cursor-pointer"
                        />
                        <LuClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-lg" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-black uppercase tracking-wide text-[hsl(var(--color-text))] mb-2">
                        End Time
                      </label>
                      <div className="relative group">
                        <input
                          type="time"
                          value={tc?.endTime ?? "17:00"}
                          onChange={(e) =>
                            setTimeConfig((prev) => ({
                              ...prev,
                              [day]: { ...prev[day]!, endTime: e.target.value },
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-base font-bold outline-none focus:border-[hsl(var(--color-text))] focus:bg-[hsl(var(--color-bg-surface))] transition-all cursor-pointer"
                        />
                        <LuClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-lg" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase tracking-wide text-[hsl(var(--color-text))] mb-2.5">
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
                          className={`px-4 py-2 rounded-xl text-base font-bold border transition-all duration-300 cursor-pointer ${
                            tc?.appointmentDuration === d
                              ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))] shadow-md -translate-y-0.5"
                              : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] hover:-translate-y-0.5"
                          }`}
                        >
                          {d} min
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => handleSaveDay(day)}
                      isLoading={savingDay === day}
                      className="w-full !py-3.5 !rounded-xl !bg-[hsl(var(--color-primary))] !text-[hsl(var(--color-text-inverse))] hover:!bg-[hsl(var(--color-primary-strong))]"
                    >
                      {isSaved ? (
                        <>
                          <LuPencil className="inline mr-1.5" />
                          Update Schedule
                        </>
                      ) : (
                        "Save Schedule"
                      )}
                    </Button>
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