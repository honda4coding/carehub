"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuCalendarDays,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuClock,
  LuPencil,
  LuRefreshCw,
  LuSettings2,
  LuTrash2,
} from "react-icons/lu";

import { useAuth } from "@/context/AuthContext";
import {
  Availability,
  Slot,
  deleteAvailability,
  deleteSlot,
  generateSlots,
  getAvailableSlots,
  getMyAvailability,
  setAvailability,
} from "@/services/appointmentService";
import { formatFullDate, groupSlotsByDate, slotTimeRangeLabel } from "@/components/appointments/format";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import SectionToggle from "@/components/appointments/SectionToggle";

// ─── Constants ─────────────────────────────────────────────────────────────────
const DAYS = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
] as const;
type Day = (typeof DAYS)[number];

const DAY_LABELS: Record<Day, string> = {
  sunday: "Sun", monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat",
};

const DURATIONS = [15, 20, 30, 45, 60] as const;

type DayConfig = { startTime: string; endTime: string; appointmentDuration: number };

// ─── Slot chip ──────────────────────────────────────────────────────────────────
function SlotChip({
  slot,
  onDelete,
  deleting,
}: {
  slot: Slot;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-2.5 hover:border-[hsl(var(--color-text-muted)/0.3)] transition-colors duration-150">
      <span className="text-[12.5px] font-bold text-[hsl(var(--color-text))]">
        {slotTimeRangeLabel(slot)}
      </span>
      <button
        onClick={() => onDelete(slot._id)}
        disabled={deleting}
        className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors disabled:opacity-40"
        title="Delete slot"
      >
        <LuTrash2 className="text-[13px]" />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const doctorId = (user as any)?._id ?? user?.id ?? "";

  const [toast, setToast] = useState<{
    msg: string;
    variant: "success" | "error";
  } | null>(null);

  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [selectedDays, setSelectedDays] = useState<Set<Day>>(new Set());
  const [timeConfig, setTimeConfig] = useState<Partial<Record<Day, DayConfig>>>({});
  // tracks which days are already saved on the backend, and their record id
  const [savedIds, setSavedIds] = useState<Partial<Record<Day, string>>>({});
  const [expandedDay, setExpandedDay] = useState<Day | null>(null);
  const [savingDay, setSavingDay] = useState<Day | null>(null);
  const [deletingDay, setDeletingDay] = useState<Day | null>(null);

  const [generateRange, setGenerateRange] = useState({ startDate: "", endDate: "" });
  const [generating, setGenerating] = useState(false);

  const [mySlots, setMySlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  // ── Load existing weekly schedule + open slots on mount ────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAvailability();
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
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to load your schedule", variant: "error" });
      } finally {
        setLoadingAvailability(false);
      }
    })();
  }, []);

  async function loadMySlots() {
    if (!doctorId) return;
    setSlotsLoading(true);
    try {
      const data = await getAvailableSlots(doctorId);
      setMySlots(data);
    } catch (err: any) {
      setToast({ msg: err.message || "Failed to load your open slots", variant: "error" });
    } finally {
      setSlotsLoading(false);
    }
  }

  useEffect(() => {
    loadMySlots();
  }, [doctorId]);

  function toggleDay(day: Day) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
        if (!timeConfig[day]) {
          setTimeConfig((tc) => ({
            ...tc,
            [day]: { startTime: "09:00", endTime: "17:00", appointmentDuration: 30 },
          }));
        }
      }
      return next;
    });
  }

  async function handleSaveDay(day: Day) {
    const tc = timeConfig[day];
    if (!tc?.startTime || !tc?.endTime) return;
    setSavingDay(day);
    try {
      const saved = await setAvailability({
        day,
        startTime: tc.startTime,
        endTime: tc.endTime,
        appointmentDuration: tc.appointmentDuration,
      });
      setSavedIds((prev) => ({ ...prev, [day]: saved._id }));
      setToast({
        msg: `${DAY_LABELS[day]} availability ${savedIds[day] ? "updated" : "saved"}`,
        variant: "success",
      });
      setExpandedDay(null);
    } catch (err: any) {
      setToast({ msg: err.message || "Failed to save availability", variant: "error" });
    } finally {
      setSavingDay(null);
    }
  }

  async function handleDeleteDay(day: Day) {
    const id = savedIds[day];
    if (!id) {
      // never actually saved — just remove it locally
      setSelectedDays((prev) => {
        const next = new Set(prev);
        next.delete(day);
        return next;
      });
      return;
    }
    setDeletingDay(day);
    try {
      await deleteAvailability(id);
      setSelectedDays((prev) => {
        const next = new Set(prev);
        next.delete(day);
        return next;
      });
      setTimeConfig((prev) => {
        const next = { ...prev };
        delete next[day];
        return next;
      });
      setSavedIds((prev) => {
        const next = { ...prev };
        delete next[day];
        return next;
      });
      setToast({ msg: `${DAY_LABELS[day]} availability removed`, variant: "success" });
    } catch (err: any) {
      setToast({ msg: err.message || "Could not remove this day", variant: "error" });
    } finally {
      setDeletingDay(null);
    }
  }

  async function handleGenerate() {
    if (!generateRange.startDate || !generateRange.endDate) {
      setToast({ msg: "Please pick a start and end date", variant: "error" });
      return;
    }
    setGenerating(true);
    try {
      const res = await generateSlots(generateRange);
      setToast({
        msg: `Generated ${res.count ?? "your"} slots successfully`,
        variant: "success",
      });
      loadMySlots();
    } catch (err: any) {
      setToast({ msg: err.message || "Failed to generate slots", variant: "error" });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    setDeletingSlot(slotId);
    try {
      await deleteSlot(slotId);
      setMySlots((prev) => prev.filter((s) => s._id !== slotId));
      setToast({ msg: "Slot removed", variant: "success" });
    } catch (err: any) {
      setToast({ msg: err.message || "Could not delete slot", variant: "error" });
    } finally {
      setDeletingSlot(null);
    }
  }

  const slotGroups = useMemo(() => groupSlotsByDate(mySlots), [mySlots]);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 shadow-[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 rounded-[12px] bg-[hsl(var(--color-primary)/0.12)] text-primary items-center justify-center text-[18px] shrink-0">
            <LuSettings2 />
          </div>
          <div>
            <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              My Schedule
            </h1>
            <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              Set your weekly hours and generate bookable slots
            </p>
          </div>
        </div>
        <SectionToggle />
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
          {/* ── LEFT: Weekly availability setup ── */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-1">
              <LuCalendarDays className="text-primary text-[14px]" />
              <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                Weekly schedule
              </p>
            </div>
            <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mb-5">
              Pick your working days and hours — saved days are marked and can be edited or removed anytime
            </p>

            {loadingAvailability ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[46px] rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
                ))}
              </div>
            ) : (
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
                      {/* Day row */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleDay(day)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                            isSelected
                              ? "bg-primary border-primary shadow-[0_2px_6px_hsl(var(--color-primary)/0.4)]"
                              : "border-[hsl(var(--color-border))] hover:border-primary"
                          }`}
                        >
                          {isSelected && <LuCheck className="text-white text-[11px]" />}
                        </button>

                        <span
                          className={`text-[13px] font-bold flex-1 flex items-center gap-1.5 ${
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

                        {/* Time summary + expand */}
                        {isSelected && tc && (
                          <button
                            onClick={() => setExpandedDay(isExpanded ? null : day)}
                            className="flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary-strong transition-colors"
                          >
                            {tc.startTime} – {tc.endTime}
                            {isExpanded ? (
                              <LuChevronDown className="text-[12px]" />
                            ) : (
                              <LuChevronRight className="text-[12px]" />
                            )}
                          </button>
                        )}

                        {/* Delete saved day */}
                        {isSaved && (
                          <button
                            onClick={() => handleDeleteDay(day)}
                            disabled={deletingDay === day}
                            className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors disabled:opacity-40 shrink-0"
                            title="Remove this day"
                          >
                            <LuTrash2 className="text-[13px]" />
                          </button>
                        )}
                      </div>

                      {/* Expanded time + duration picker */}
                      {isSelected && isExpanded && (
                        <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] px-4 py-3 space-y-3">
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1">
                                Start
                              </label>
                              <input
                                type="time"
                                value={tc?.startTime ?? "09:00"}
                                onChange={(e) =>
                                  setTimeConfig((prev) => ({
                                    ...prev,
                                    [day]: { ...prev[day]!, startTime: e.target.value },
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1">
                                End
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
                                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5">
                              Appointment duration
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                              {DURATIONS.map((d) => (
                                <button
                                  key={d}
                                  onClick={() =>
                                    setTimeConfig((prev) => ({
                                      ...prev,
                                      [day]: { ...prev[day]!, appointmentDuration: d },
                                    }))
                                  }
                                  className={`px-3 py-1 rounded-lg text-[11.5px] font-bold border transition-all duration-150 ${
                                    tc?.appointmentDuration === d
                                      ? "bg-primary text-white border-primary"
                                      : "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:border-primary hover:text-primary"
                                  }`}
                                >
                                  {d} min
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveDay(day)}
                            disabled={savingDay === day}
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[12px] font-bold shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)] hover:opacity-90 disabled:opacity-60 transition-opacity"
                          >
                            {isSaved && <LuPencil className="text-[11px]" />}
                            {savingDay === day ? "Saving…" : isSaved ? "Update" : "Save"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Generate slots ── */}
          <div className="space-y-5">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-1">
                <LuRefreshCw className="text-primary text-[14px]" />
                <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                  Generate slots
                </p>
              </div>
              <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mb-4">
                Pick a date range and we will create all slots from your saved weekly schedule
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[12px] font-bold text-[hsl(var(--color-text))] mb-1.5">
                    From
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={generateRange.startDate}
                    onChange={(e) =>
                      setGenerateRange((r) => ({ ...r, startDate: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[hsl(var(--color-text))] mb-1.5">
                    To
                  </label>
                  <input
                    type="date"
                    min={generateRange.startDate || new Date().toISOString().split("T")[0]}
                    value={generateRange.endDate}
                    onChange={(e) =>
                      setGenerateRange((r) => ({ ...r, endDate: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || selectedDays.size === 0}
                className="w-full py-3 rounded-xl bg-primary text-white text-[13.5px] font-bold shadow-[0_4px_14px_hsl(var(--color-primary)/0.35)] hover:opacity-90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <LuRefreshCw className={`text-[14px] ${generating ? "animate-spin" : ""}`} />
                {generating ? "Generating…" : "Generate slots"}
              </button>

              {selectedDays.size === 0 && (
                <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] text-center mt-2">
                  Select at least one working day first
                </p>
              )}
            </div>

            {/* Existing / generated slots */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <LuClock className="text-primary text-[14px]" />
                <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                  Your open slots
                </p>
              </div>

              {slotsLoading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[44px] rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
                  ))}
                </div>
              ) : slotGroups.length === 0 ? (
                <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] text-center py-6">
                  No open slots yet — generate some from your weekly schedule above.
                </p>
              ) : (
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {slotGroups.map((group) => (
                    <div key={group.dateKey}>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">
                        {formatFullDate(group.dateObj)}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.slots.map((slot) => (
                          <SlotChip
                            key={slot._id}
                            slot={slot}
                            onDelete={handleDeleteSlot}
                            deleting={deletingSlot === slot._id}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <AppointmentToast
          message={toast.msg}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
